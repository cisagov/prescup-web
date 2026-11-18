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
                const photo = gallery.locator('.pc-photo-carousel__slide:not([data-pc-clone])').first();
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
            const button = page.locator('.pc-photo-carousel__rotation');
            const track = page.locator('.pc-photo-carousel__track');
            const transform = () => track.evaluate(e => e.style.transform);
            const initial = await transform();
            await page.waitForTimeout(3800);
            assert.equal(await transform(), initial, 'gallery starts paused');
            await button.focus(); await page.keyboard.press('Enter'); await page.mouse.move(0, 0);
            await page.waitForTimeout(4100);
            assert.notEqual(await transform(), initial, 'explicit Start advances slides');
            await page.keyboard.press('Enter');
            await page.locator('header a').first().focus();
            const paused = await transform();
            await page.waitForTimeout(4100);
            assert.equal(await transform(), paused, 'Pause persists after focus leaves');
            await button.focus(); await page.keyboard.press('Enter');
            await page.getByRole('button', { name: 'Next photos', exact: true }).focus();
            assert.equal(await button.textContent(), 'Start slideshow', 'entering gallery controls stops rotation');
            await context.newPage().then(async p => {
                await p.emulateMedia({ reducedMotion: 'reduce' });
                await p.goto(`${base}/${route}`, { waitUntil: 'networkidle' });
                assert.equal(await p.locator('.pc-photo-carousel__rotation').textContent(), 'Start slideshow');
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
            assert.equal(await member.getAttribute('aria-label'), `View ${name} profile`);
            await member.focus(); await page.keyboard.press('Enter');
            await page.locator('#memberModal.show').waitFor();
            await page.waitForTimeout(350);
            assert.equal(await page.locator('#modal-name').textContent(), name);
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
        console.log('PASS keyboard, focus, playback, image spacing, member profiles, reduced motion, and page error checks');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
