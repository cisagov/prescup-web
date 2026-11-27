# President's Cup Website - Section 508 Remediation Status

**November 24, 2026**  
**Branch:** `pc8-v8.1.8b`  
**Reviewed commit:** `0691af1`  
**Scope:** Public marketing pages in this repository: Home, PC8, Media, Workshops, Game of the Month, and Hack of Fame.

## Summary

We have corrected the seven code-focused items identified in the November 17 Section 508 audit: keyboard operation of the Hack of Fame spotlight; photo lightbox focus; member and dialog names; uncontrolled gallery and arrow movement; the low-contrast Game of the Month link; malformed lists; and page headings, navigation, and skip links. We also improved photo descriptions, focus visibility, link names, and several responsive details identified in the supplemental WCAG review.

This is substantial progress on the six marketing pages. **It is not yet a Section 508 conformance determination.** Linked documents, video alternatives, some image alternatives and contrast states, and final assistive-technology and deployed-site testing remain unresolved. Those items cannot all be described as optional. The Revised Section 508 Standards incorporate WCAG 2.0 Level A and AA for covered web content and electronic documents; a local automated scan is only one part of conformance testing. See the [U.S. Access Board's Revised 508 Standards](https://www.access-board.gov/508/) and [Section508.gov testing overview](https://www.section508.gov/test/testing-overview/).

## Section 508 audit findings addressed in the current branch

| Audit item | Change made | Evidence available |
| --- | --- | --- |
| **F01 - Spotlight keyboard operation** | Spotlight choices are named buttons with a selected state. Enter and Space update the featured image, alternative text, and caption. | Source review and local keyboard regression. |
| **F02 - Photo lightbox focus** | Open lightboxes make background controls inert, contain Tab and Shift+Tab, close on Escape, and return focus to the opening photo. | Local keyboard regression on Home and Media. |
| **F03 - Member and dialog names** | All 14 member links identify the published person or username. The profile dialog references its populated heading. | Source review and profile-dialog regression. |
| **F04 - Automatic movement** | Galleries remain still until a visitor acts. The decorative scroll arrow stops after two cycles and honors reduced motion. | Idle-gallery, control, and reduced-motion regression. |
| **F05 - Game of the Month link contrast** | The small challenge link uses darker default, hover/focus, and visited colors with an underline. | Recorded color ratios exceed 4.5:1 on the card background; local axe scan reports no violation for this link. |
| **F06 - List structure** | PC8 sublists are inside parent list items; Game of the Month introduction uses paragraphs rather than invalid list children. | Source review and local axe scans. |
| **F10 - Headings and navigation** | All six pages have one page-level heading, a named main navigation landmark, a visible-on-focus skip link, and a focusable main target. Heading levels were normalized. | Source review and local navigation regression. |

The November 18 local regression scanned 38 page and interaction states with axe-core 4.11.0 using WCAG 2.0 A/AA and best-practice tags. It found **zero violations in those scanned states**. Keyboard checks also passed for the tested galleries, lightboxes, profile dialog, skip links, focus rings, and PC8 mobile navigation. This result does not cover every visual state, document, video, assistive technology, or external application. The scanner returned 884 **incomplete color-contrast node results across repeated states**; these are not 884 distinct failures, and they are not passes.

## Remaining Section 508 work

| Audit item | Current status | What is needed |
| --- | --- | --- |
| **F07 - Linked documents** | **Open.** Four of six linked competition overviews (PC1, PC2, PC5, PC6) have no PDF tag tree. A tagged PC5 copy exists but has not been validated as a replacement. | Remediate the source documents or provide verified accessible equivalents. Check reading order, headings, lists, tables, image alternatives, and links. Review the Word justification template and agree the scope of archived ZIP and branding files. |
| **F08 - Video alternatives** | **Deferred for this round at the site owner's direction.** Featured video thumbnails have short labels identifying the videos, not descriptions of their content. Caption, transcript, and audio-description coverage has not been established. | If the videos remain in the covered scope, the media owner and accessibility reviewer need to assess each linked video and any external player. No trailer or video changes were made in this round; no audio-input work is planned. |
| **F09 - Image alternatives** | **Partially addressed.** Gallery photos have reviewed scene descriptions; the PC8 timeline has a linked HTML schedule; current Game of the Month role details are visible text. | Finish editorial review of information graphics, title/branding images, and any images whose meaning requires subject-matter knowledge. Confirm screen reader announcements are useful without duplication. |
| **F11 - Contrast over artwork** | **Partially addressed.** The known PC8 rules-section colors were measured against the restored background. Other image and gradient combinations remain incomplete in automated scans. | Inspect rendered text and controls across scroll positions, responsive widths, and hover, focus, selected, and visited states. Resolve each relevant incomplete result with measured evidence. |
| **F12 - Acceptance and deployment** | **Open.** The local test did not establish conformance of the deployed site or the full user journey. | Test supported screen readers, actual 200% browser/text zoom, forced colors, document downloads, and the deployed branch. Include registration, practice, challenge access, and support workflows with appropriate accounts and obtain agency review. |

The document, media, image-alternative, and contrast questions are potentially relevant to the WCAG 2.0 A/AA baseline incorporated into Section 508. Final acceptance testing is required before a conformance claim. The supplemental WCAG report also lists a few lower-priority or advisory items, including new-tab warnings, source text typed in capitals, and download format/size labels. Those can be tracked separately; they do not make the unresolved baseline items optional.

## Recommended status language

> We have addressed the confirmed code barriers identified on the President's Cup marketing pages and passed a targeted local automated and keyboard regression. Document and media accessibility, remaining image and contrast reviews, and deployed-site assistive-technology testing are still in progress. We are not claiming full Section 508 conformance until those items are reviewed and accepted.

## Reference audits and limits

- *President's Cup - Section 508 Accessibility Audit*, November 17, 2026, v2. Its baseline was branch `pc8-v8.1.8` at commit `4647776`.
- *President's Cup Website WCAG 2.2 Audit*, November 18, 2026. Its repository reference was `e091928`; WCAG 2.2 findings are supplemental to the incorporated Section 508 WCAG 2.0 A/AA baseline unless agency policy requires more.
- *accessiBe Report*, November 18, 2026. It examined an older home page snapshot. Its cover says "Accessible" while its first rule reports a navigation failure, so the cover is not conformance evidence.
- Current-branch evidence: `doc/accessibility-remediation.md` and `tests/accessibility.cjs`. The last recorded full local regression was November 18; the reviewed branch has not changed since that run. Live-site equivalence and a complete conformance evaluation were not established.
