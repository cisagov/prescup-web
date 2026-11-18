/* Run against a local server: BASE_URL=http://127.0.0.1:8770 node tests/accessibility.cjs
 * Requires playwright and axe-core installed in the test environment, plus Chrome.
 * Browser/scanner dependencies are development tools only; the website remains static.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:8770';
const axePath = process.env.AXE_PATH || require.resolve('axe-core/axe.min.js');
const output = process.env.AUDIT_OUTPUT || '/tmp/prescup-accessibility-results';
fs.mkdirSync(output, { recursive: true });
const routes = ['', 'pc8/', 'media/', 'workshops/', 'game-of-the-month/', 'hack-of-fame/'];

(async () => {
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    try {
        const context = await browser.newContext();
        await context.route(/googletagmanager|google-analytics|dap.digitalgov.gov/, route => route.abort());
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(String(error)));
        const summary = [];
        async function visit(route, width = 1280) {
            await page.setViewportSize({ width, height: 900 });
            await page.goto(`${base}/${route}`, { waitUntil: 'networkidle' });
        }
        async function scan(name) {
            if (!await page.evaluate(() => Boolean(window.axe))) await page.addScriptTag({ path: axePath });
            const results = await page.evaluate(() => axe.run(document, {
                runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'best-practice'] }
            }));
            fs.writeFileSync(path.join(output, `${name}.json`), JSON.stringify(results, null, 2));
            assert.deepEqual(results.violations.map(v => v.id), [], `${name}: axe violations`);
            summary.push({ name, violations: 0, incomplete: results.incomplete.map(v => ({ id: v.id, nodes: v.nodes.length })) });
            console.log(`PASS ${name}`);
        }
        // The scanner does not compare focus styles or detect missing text at intermediate widths.
        for (const width of [768, 850, 992, 993]) {
            await visit('', width);
            const visibleNotes = await page.locator('#executive-order p, .mobile-tablet-only')
                .evaluateAll(notes => notes.filter(note => note.checkVisibility({ visibilityProperty: true })).length);
            assert.equal(visibleNotes, 1, `Exactly one Executive Order note at ${width}px`);
        }
        await page.locator('#hero .btn-practice').press('Shift+Tab');
        const focus = await page.locator('#hero .btn-register').evaluate(button => ({
            keyboard: button === document.activeElement && button.matches(':focus-visible'),
            outline: getComputedStyle(button).outlineStyle,
            width: parseFloat(getComputedStyle(button).outlineWidth)
        }));
        assert(focus.keyboard && focus.outline === 'solid' && focus.width >= 2, 'Register has a keyboard focus outline');

        await visit('hack-of-fame/', 320);
        await page.addStyleTag({ content: `
            #hof-spotlight * { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; }
            #hof-spotlight p { margin-bottom: 2em !important; }
        ` });
        await page.getByRole('button', {name: /Show Jakob Kreuze/}).click();
        assert(await page.locator('.spotlight-caption').evaluate(box => {
            const range = document.createRange();
            range.selectNodeContents(box.lastElementChild);
            return range.getBoundingClientRect().bottom <= box.getBoundingClientRect().bottom;
        }), 'Full caption remains visible with user text spacing');

        await visit('media/', 320);
        const heights = await page.locator('#pc7 .tab-content-media-left .list-unstyled a')
            .evaluateAll(links => links.map(link => link.getBoundingClientRect().height));
        assert(heights.length && heights.every(height => height >= 24), 'Media download targets are at least 24px high');

        for (const width of [390, 1280]) {
            await visit('pc8/', width);
            await page.locator('#eligibility').scrollIntoViewIfNeeded();
            await page.waitForFunction(() => ['#pc8SideNav', '#pc8MobileMenu'].every(selector => {
                const current = document.querySelectorAll(selector + ' [aria-current="location"]');
                return current.length === 1 && current[0].hash === '#eligibility';
            }));
            if (width === 390) assert(await page.getByRole('button', { name: /Jump to section.*Eligibility/i }).isVisible());
        }
        // Reverse-tab to a link that the sticky bar would otherwise cover.
        await visit('pc8/', 390);
        const registrationPortal = page.getByRole('link', { name: 'CISA Registration Portal (access.cisa.gov)', exact: true });
        await page.locator('#registration a[href$="/ctf/events"]').first().focus();
        await registrationPortal.evaluate(link => {
            window.scrollTo({ top: window.scrollY + link.getBoundingClientRect().top - 6, behavior: 'instant' });
        });
        await page.keyboard.press('Shift+Tab');
        await page.waitForFunction(() => {
            const link = document.activeElement;
            const bar = document.getElementById('pc8MobileBar').getBoundingClientRect();
            return link.getAttribute('href') === 'https://access.cisa.gov/' &&
                bar.top <= 1 && link.getBoundingClientRect().top >= bar.bottom + 8;
        }, null, { timeout: 3000 });
        console.log('PASS PC8 keyboard focus clears the sticky mobile bar');

        for (const width of [320, 390, 768, 1280]) {
            for (const route of routes) {
                await visit(route, width);
                assert.equal(await page.locator('h1').count(), 1, `${route}: one page title`);
                await page.keyboard.press('Tab');
                assert.equal(await page.locator('.skip-link').evaluate(e => e === document.activeElement), true);
                await page.keyboard.press('Enter');
                assert.equal(await page.locator('main').evaluate(e => e === document.activeElement), true);
                assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
                await scan(`${route.replaceAll('/', '') || 'home'}-${width}`);
            }
        }
        for (const route of ['', 'media/']) {
            for (const width of [320, 390, 1280]) {
                await visit(route, width);
                const gallery = page.locator('.pc-photo-carousel');
                const photos = gallery.locator('.pc-photo-carousel__slide:not([data-pc-clone])');
                const photo = photos.first();
                assert.equal(await gallery.getByRole('button', { name: /^(Start|Pause) slideshow$/ }).count(), 0);
                await gallery.getByRole('button', { name: 'Previous photos', exact: true }).focus();
                for (let index = 0; index < await photos.count(); index++) {
                    await page.keyboard.press('Tab');
                    const ring = await photos.nth(index).evaluate(slide => {
                        const bounds = slide.getBoundingClientRect();
                        const viewport = slide.closest('.pc-photo-carousel__viewport').getBoundingClientRect();
                        const style = getComputedStyle(slide);
                        const outset = parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset);
                        return {
                            focused: document.activeElement === slide && slide.matches(':focus-visible'),
                            visible: style.outlineStyle === 'solid' && parseFloat(style.outlineWidth) >= 2,
                            fits: bounds.left - outset >= viewport.left && bounds.right + outset <= viewport.right
                                && bounds.top - outset >= viewport.top && bounds.bottom + outset <= viewport.bottom
                        };
                    });
                    assert(ring.focused && ring.visible && ring.fits, `${route || 'home'} ${width}px: full focus ring on photo ${index + 1}`);
                }
                await page.keyboard.press('Shift+Tab');
                assert.equal(await photos.nth(await photos.count() - 2).evaluate(slide => document.activeElement === slide), true);
                await photo.focus();
                await page.keyboard.press('Enter');
                const close = page.getByRole('button', { name: 'Close photo', exact: true });
                assert.equal(await close.evaluate(e => e === document.activeElement), true);
                await page.keyboard.press('Shift+Tab');
                assert.equal(await page.getByRole('button', { name: 'Next photo', exact: true }).evaluate(e => e === document.activeElement), true);
                await page.keyboard.press('Tab');
                assert.equal(await close.evaluate(e => e === document.activeElement), true);
                assert.equal(await page.locator('header').evaluate(e => e.inert), true);
                await page.locator('header a').first().evaluate(e => e.focus());
                assert.equal(await close.evaluate(e => e === document.activeElement), true);
                const before = await page.locator('.pc-photo-lightbox__counter').textContent();
                await page.keyboard.press('ArrowRight');
                assert.notEqual(await page.locator('.pc-photo-lightbox__counter').textContent(), before);
                await page.locator('.pc-photo-lightbox__image').evaluate(e => e.decode());
                const image = await page.locator('.pc-photo-lightbox__image').boundingBox();
                const left = await page.getByRole('button', { name: 'Previous photo', exact: true }).boundingBox();
                const right = await page.getByRole('button', { name: 'Next photo', exact: true }).boundingBox();
                assert(left.x + left.width <= image.x && image.x + image.width <= right.x, 'lightbox arrows do not overlap photo');
                await scan(`${route ? 'media' : 'home'}-lightbox-${width}`);
                await page.screenshot({ path: path.join(output, `${route ? 'media' : 'home'}-lightbox-${width}.png`) });
                await page.keyboard.press('Escape');
                assert.equal(await photo.evaluate(e => e === document.activeElement), true);
                assert.equal(await page.locator('[inert]').count(), 0);
                // Focusing the last original photo must reveal it rather than hide focus offscreen.
                const last = gallery.locator('.pc-photo-carousel__slide:not([data-pc-clone])').last();
                await last.focus();
                const bounds = await last.boundingBox();
                const viewport = await gallery.locator('.pc-photo-carousel__viewport').boundingBox();
                assert(bounds.x >= viewport.x - 1 && bounds.x + bounds.width <= viewport.x + viewport.width + 1);
            }
            await visit(route);
            const track = page.locator('.pc-photo-carousel__track');
            const transform = () => track.evaluate(e => e.style.transform);
            const initial = await transform();
            await page.waitForTimeout(4500);
            assert.equal(await transform(), initial, 'gallery remains still past the rotation interval');
            await page.getByRole('button', { name: 'Next photos', exact: true }).press('Enter');
            assert.notEqual(await transform(), initial, 'Next photos still advances the gallery');
            await track.evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished)));
            await page.getByRole('button', { name: 'Previous photos', exact: true }).press('Enter');
            assert.equal(await transform(), initial, 'Previous photos returns to the original position');
            await context.newPage().then(async p => {
                await p.emulateMedia({ reducedMotion: 'reduce' });
                await p.goto(`${base}/${route}`, { waitUntil: 'networkidle' });
                assert.equal(await p.getByRole('button', { name: /^(Start|Pause) slideshow$/ }).count(), 0);
                if (!route) assert.equal(await p.locator('.scroll-arrow').evaluate(e => getComputedStyle(e).animationName), 'none');
                await p.close();
            });
        }
        await visit('hack-of-fame/');
        const thumbs = page.locator('button.spotlight-thumbnail:visible');
        for (let i = 0; i < await thumbs.count(); i++) {
            const button = thumbs.nth(i);
            await button.focus(); await page.keyboard.press(i % 2 ? 'Space' : 'Enter');
            assert.equal(await button.getAttribute('aria-pressed'), 'true');
            assert.equal(await page.locator('.spotlight-thumbnail[aria-pressed=true]').count(), 1);
            assert.equal(await page.locator('#spotlight-image').getAttribute('alt'), `${await button.getAttribute('data-name')}, ${await button.getAttribute('data-details')}`);
        }
        const members = page.locator('[data-bs-target="#memberModal"]');
        for (let i = 0; i < await members.count(); i++) {
            const member = members.nth(i);
            const name = await member.getAttribute('data-name');
            const handle = await member.getAttribute('data-handle');
            const label = name && name !== handle
                ? `View ${name.replace(/\s+/g, ' ').trim()} profile (username ${handle})`
                : `View ${handle} profile`;
            assert.equal(await page.getByRole('link', { name: label, exact: true }).count(), 1);
            await member.focus(); await page.keyboard.press('Enter');
            await page.locator('#memberModal.show').waitFor();
            await page.waitForTimeout(350);
            assert.equal(await page.locator('#modal-name').textContent(), name?.trim() || handle);
            assert.equal(await page.locator('#modal-handle').isVisible(), Boolean(handle && name && name.trim() !== handle));
            assert.equal(await page.locator('#memberModal').getAttribute('aria-labelledby'), 'modal-name');
            if (i === 0) await scan('member-dialog');
            await page.keyboard.press('Escape'); await page.waitForTimeout(350);
            assert.equal(await member.evaluate(e => e === document.activeElement), true);
        }
        await visit('media/');
        for (const id of ['pc7', 'pc6', 'pc5', 'pc4', 'pc3', 'pc2', 'pc1']) {
            await page.locator(`#${id}-tab`).click();
            await page.waitForFunction(id => {
                const panel = document.getElementById(id);
                return panel.classList.contains('show') && getComputedStyle(panel).opacity === '1';
            }, id);
            await scan(`media-tab-${id}`);
        }
        assert.deepEqual(errors, [], 'no uncaught browser errors');
        fs.writeFileSync(path.join(output, 'summary.json'), JSON.stringify(summary, null, 2));
        console.log('PASS keyboard, focus rings, manual galleries, image spacing, member profiles, reduced motion, and page error checks');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
