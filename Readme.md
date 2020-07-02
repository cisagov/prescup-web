# prescup-web

Contains static files for the landing site.

(Import images to a separate file store.)

Contains toc-md files (table-of-contents-markdown)files that the gameboards pull in and render.

## toc-md
Provides a set up markdown files via a table of contents list.
Applications can fetch a `toc.json` and render the markdown however desired.

The `toc.json` is string array of filenames.

Filename format is `Display-File_Name.md`
* The display prefix is optional, and is used to override the actual file name.
* Underscores are turned into spaces for display.
* Relative links aren't working yet so use absolute links in the markdown.
