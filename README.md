# presidentscup.cisa.gov Web Content

This repository contains static web content for [presidentscup.cisa.gov](https://presidentscup.cisa.gov) as well as toc-md files (table-of-contents-markdown) files that competition [gameboards](https://github.com/cmu-sei/gameboard) pull in and render.

## toc-md
Provides a set up Markdown files via a table of contents list.
Applications can fetch a `toc.json` and render the Markdown however desired.

The `toc.json` is a string array of filenames.

Filename format is `Display-File_Name.md`.
* The display prefix is optional, and is used to override the actual file name.
* Underscores are turned into spaces for display.
