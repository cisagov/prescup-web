# toc-md

Provides a set up markdown files via a table of contents list.
Applications can fetch a `toc.json` and render the markdown however desired.

Use a table-of-contents file `toc-*.json` to define the set of files.

Filename format is `Display-File_Name.md`
* The display prefix is optional, and is used to override the actual file name.
* Underscores are turned into spaces for display.
* Relative links aren't working yet so use absolute.
