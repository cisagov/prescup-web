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

The two stacked Game of the Month social links now have tap targets at least 24 CSS pixels tall. This addresses the target-size finding from the supplemental review.

## November 18 scan comparison and follow-up

The three supplied reference reports are snapshots of earlier code, not scans of this branch: the Section 508 audit names `pc8-v8.1.8` at `4647776`, the WCAG 2.2 report names `e091928`, and the accessiBe report shows the older homepage navigation and generic gallery labels. The accessiBe cover calls the page accessible even though its own first rule records a navigation failure; that cover is not conformance evidence.

This follow-up gives the four icon-only homepage Toolkit links destination names without the redundant word “Icon.” The shared GoM and HoF navigation links now expand their abbreviations in their accessible names. The PC8 section menu's hourglass is decorative. The PC8 justification-letter link identifies the Word format and download size. The Game of the Month X mark is decorative and each handle identifies its platform. Workshop testimonial attributions are outside the quoted text, and the Hack of Fame eligibility link names its destination. No trailer or video links, files, captions, or players were changed; audio-input work is outside this round.

The supplied WCAG report's remaining document finding (F-15) agrees with Section 508 F07: four directly linked overviews are untagged. A separate PC5 copy has a tag tree and matched the linked copy's extracted text and rendered appearance in a preliminary comparison, but its tag order, alternatives, and assistive-technology behavior have not been verified, so the download link remains unchanged. The WCAG report's F-24 default body-color concern also remains open: setting a black body background caused confirmed low contrast in the transparent homepage timeline section and was reverted. Its optional new-tab warning (F-21), Media asset format/size labels (F-35), and runtime iframe observation (F-34) require separate decisions or reproduction. Video findings (F-04 and F-36) are excluded from this round as requested.

## Verification

The regression script `tests/accessibility.cjs` uses Chrome with Playwright and axe-core 4.11.0. It checks the six main pages at 320, 390, 768, and 1280 pixels, both lightboxes at 320, 390, and 1280 pixels, all seven Media panels, and the profile dialog. It includes keyboard activation, focus containment/restoration, offscreen photo focus, full focus ring visibility, idle galleries, Previous/Next controls, reduced motion, skip links, page width, photo/arrow separation, and browser JavaScript errors.

Zero axe violations were reported in the 38 scanned page/state combinations, using WCAG 2.0 A/AA and best-practice tags. Incomplete results, including image/gradient contrast checks, remain unresolved; they are not passes. Targeted desktop/mobile screenshots were inspected with visible images loaded. Width checks do not replace a 200% zoom assessment.

The full 38-state local regression was rerun after the November 18 changes and again reported zero violations. It covered the six pages at 320, 390, 768, and 1280 pixels, both lightboxes at three widths, all seven Media panels, and the profile dialog. It also passed keyboard and focus checks. The scanner still returned 884 `color-contrast` incomplete node-results summed across repeated states; these are not 884 distinct failures or passes. A focused browser check confirmed the expanded GoM/HoF names on all six pages, the four Toolkit link names, and both testimonial attributions. This is local-branch evidence only; live deployment, screen readers, actual 200% zoom, PDF reading order, and full image-background contrast remain unverified.

### November 24 follow-up

| Finding | Result |
| --- | --- |
| F09: Image alternatives | Addressed on the six marketing pages. The two homepage timeline layouts link directly to the text schedule for individuals and teams, which now includes the virtual and in-person formats. The 10 published Spotlight photos have scene descriptions alongside their existing identity and event captions. The December Game of the Month poster repeats the text in and below its link. Redundant title artwork is decorative and the Media Archive title image uses the words shown in the graphic. |
| F11: Contrast over artwork | Fixed the mobile timeline's two white-on-blue labels (now 6.42:1) and a Workshops icon that overlapped text at 768 CSS pixels. The PC8 keyboard outline and desktop current-section marker are brighter against the same artwork. The gallery and lightbox arrows remain visible in both tested forced-color palettes. |
| F12: Acceptance and deployment | Local browser checks passed. Deployment equivalence, testing with the agency's supported screen readers, and authenticated workflows remain open. |

The 38-state regression returned zero axe-core 4.11.4 violations and 886 repeated incomplete contrast results. A separate check masked foreground text and underlines and sampled the pixels behind visible text in 32 browser cases at widths from 320 to 1920 CSS pixels. All 1,276 measured results met their text-size thresholds. Text covered by a modal, menu, or sticky bar was checked in the corresponding unobstructed state. The artwork and CSS also provide contrast bounds for PC8 links in default, hover and focus states, as well as its current-section marker. The Game of the Month visited-link color was checked against its card background.

Chrome's browser zoom was set to 200% in a temporary profile, reducing its layout width from 1280 to 640 CSS pixels. All six pages passed keyboard and horizontal overflow checks in the default palette and in emulated light and dark forced colors. The checks included the text schedule, PC8 rules/practice/support navigation, Media tabs, the featured challenge link, and the Spotlight image update. Browser accessibility snapshots confirmed the exposed names and text. Actual screen reader testing remains a separate acceptance step.

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
2. **F08 — video and audio (excluded from this round).** Featured video thumbnails have `alt` text and visible link titles that identify the videos; those short labels do not describe the video content. Confirm captions, transcripts, and audio-description needs for linked local MP4s and external YouTube content if this work is resumed. The original audit did not establish whether embedded/open captions exist. The current round leaves trailers and videos unchanged and does not pursue audio-input work.
3. **F12 — acceptance and deployment.** Verify the intended deployed build and served files. Retest the local acceptance paths with the agency's supported screen readers and browsers on that build. Use authorized test accounts for registration, practice, challenge access, and support. Record results for each in-scope workflow and obtain agency acceptance.

## References

- [Modal dialog keyboard and focus behavior](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [Carousel accessibility pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/)
- [Section 508 testing overview](https://www.section508.gov/test/testing-overview/)
