# Accessibility remediation — pc8-v8.1.8b

This change addresses the code findings in the November 17, 2026 accessibility audit of `pc8-v8.1.8` (commit `4647776`). It does not constitute Section 508 certification or close the document, media, assistive-technology, or external-service reviews.

## Implemented

| Audit item | Change |
| --- | --- |
| F01: Spotlight keyboard controls | Spotlight thumbnails are native buttons with descriptive names, visible focus, and a selected state. Enter and Space update the image, alternative text, and caption together. Hidden legacy placeholders remain hidden. |
| F02: Photo lightboxes | Background elements become inert while a lightbox is open. Tab and Shift+Tab cycle through its controls, Escape closes it, and focus returns to the opening photo. Existing inert states are preserved. Keyboard navigation also reveals offscreen carousel photos and uses precise slide widths. |
| F03: Profile names | All 14 profile links include the published username. Where the site also publishes a name, the link includes both. The dialog uses the published name as its heading, or the username when no name is available. Redundant avatar/icon alternatives are empty. |
| F04: Motion controls | The homepage and Media galleries advance only by visitor action. The existing optional playback controls can be enabled later with `data-autoplay="true"` and require an explicit Start. Manual slide transitions honor reduced motion. The decorative scroll arrow stops after five seconds or stays still with reduced motion. |
| F05: Link contrast | Game of the Month links use darker default, hover/focus, and visited colors with underlines. Contrast against `#f8f8fa`: default 6.40:1, hover/focus 9.69:1, visited 7.90:1. |
| F06: List structure | PC8 sublists belong to their parent list items, including hidden legacy examples. Game of the Month introductory paragraphs use a normal container; its challenge list is outside the paragraph. |
| F09: Image alternatives — partial | The 30 gallery photographs have scene descriptions based on visual review; the same 14 PC7 descriptions are used on Media. No new participant identities are inferred. Spotlight descriptions use existing published captions. The homepage timeline links to the HTML schedule. December work roles are available as visible text. Incorrect image names and redundant decorative icon alternatives are corrected. The gallery descriptions, Spotlight captions, and homepage timeline label were reviewed with the site owner. Other information graphics still need review. |
| F10: Navigation and headings | All six main pages have one page-level heading, a navigation landmark named Main Menu, a visible-on-focus skip link, and a focusable main-content target. Section/subsection levels are normalized while retaining their styling. Media tab labels are not headings. The PC8 section navigation no longer creates a nested complementary landmark. |
| F11: Background contrast — partial | The original PC8 backdrop is restored. Its brightest pixel is #4f4f4f. In the rules sections, normal blue text (#87c9ff), hover/focus blue (#a9d7ff), and body text (#f8f9fa) each exceed 4.5:1 against that pixel. Other backgrounds, layers and interactive states still require review. |

Shared gallery accessibility behavior lives in `js/photo-gallery-accessibility.js`; the galleries retain their existing photo order/layout logic. Versioned stylesheet and gallery script URLs invalidate cached assets. Existing routes, approved challenge copy, downloadable documents, videos, and artwork files remain in place.

The follow-up revision restores the keyboard outline on registration links, lets longer spotlight captions expand with text spacing, corrects the competition logo and footer link names, shows the Executive Order note at intermediate tablet widths, and gives Media download links a minimum height of 24 CSS pixels. Both PC8 section menus now expose the current location, and the mobile toggle identifies its purpose. Image links show the focus outline around the artwork, and the featured Game of the Month link has one outline around its title and image.

Both galleries now stay still until a visitor interacts with them. This addresses motion findings F04 in the Section 508 audit and F-10 in the supplemental WCAG 2.2 review. Inset focus rings stay visible as visitors tab to photos at the edges of the gallery, supporting the supplemental review’s F-02 and F-11 findings. Lightbox focus containment and return were retested for F02 and F-12.

The PC8 mobile page scrolls a newly focused control clear of the sticky section bar when needed. The registration link was retested with Tab and Shift+Tab at 320px, 390px, and 768px. This addresses supplemental finding F-32.

## Verification

The regression script `tests/accessibility.cjs` uses Chrome with Playwright and axe-core 4.11.0. It checks the six main pages at 320, 390, 768, and 1280 pixels, both lightboxes at 320, 390, and 1280 pixels, all seven Media panels, and the profile dialog. It includes keyboard activation, focus containment/restoration, offscreen photo focus, full focus ring visibility, idle galleries, Previous/Next controls, reduced motion, skip links, page width, photo/arrow separation, and browser JavaScript errors.

Zero axe violations were reported in the 38 scanned page/state combinations, using WCAG 2.0 A/AA and best-practice tags. Incomplete results, including image/gradient contrast checks, remain unresolved; they are not passes. Targeted desktop/mobile screenshots were inspected with visible images loaded. Width checks do not replace a 200% zoom assessment.

To rerun, serve the checkout locally and supply Playwright, axe-core, and Chrome in the development environment. For example, install the test packages in a temporary directory rather than adding runtime dependencies to the website:

```sh
npm install --prefix /tmp/prescup-a11y-tools playwright axe-core
python3 -m http.server 8770 --bind 127.0.0.1
# In another terminal, from the repository root:
NODE_PATH=/tmp/prescup-a11y-tools/node_modules BASE_URL=http://127.0.0.1:8770 node tests/accessibility.cjs
```

Raw scanner JSON and screenshots are written outside the repository (default `/tmp/prescup-accessibility-results`; override with `AUDIT_OUTPUT`). Override `AXE_PATH` when using an independently supplied axe script. Analytics requests are blocked in tests; page styling, fonts, images, Bootstrap, and site JavaScript load normally. No scanner is included in the public pages.

## Remaining review queue

1. **F07 — downloadable documents.** Review the six linked competition overviews, particularly the untagged PC1, PC2, PC5, and PC6 files. Decide whether to provide accessible HTML equivalents alongside the PDFs or remediate the source documents and export tagged replacements. Verify reading order, tables, headings, alternatives, links, and visual equivalence. Review the existing alternative PC5 PDF before changing the download link. Include the Word justification template and agree the scope of archived ZIP/branding assets. AI can prepare equivalents and assist reconstruction; the document owner/specialist must approve and test them.
2. **F08 — video and audio.** Confirm captions, transcripts, and audio-description needs for the seven directly linked local MP4s and external YouTube content. The original audit did not establish whether embedded/open captions exist. Approved caption/transcript files can be integrated after review of accuracy, timing, speakers, and essential visual information.
3. **F09 — content approval.** Review remaining information graphics, logos containing text, archived challenge imagery, and any text alternatives that need subject-matter knowledge.
4. **F11 — remaining contrast states.** Check incomplete scanner results and rendered image/gradient backgrounds across scroll positions, responsive sizes, hover, focus, selected, and visited states. Check any agency-specific newer non-text contrast requirements separately.
5. **F12 — acceptance and deployment.** Test with supported screen readers, actual 200% browser/text zoom, forced colors, and agreed complete workflows. Verify the intended deployed branch and served files, then test registration, practice, challenge access, and support with appropriate accounts. The upstream production site and external applications are not changed or certified by this branch.

## References

- [Modal dialog keyboard and focus behavior](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [Carousel accessibility pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/)
- [Section 508 testing overview](https://www.section508.gov/test/testing-overview/)
