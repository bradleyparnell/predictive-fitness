# RunDot × LA Marathon Series email comps

This folder contains web-preview versions of the three RunDot-branded registration emails:

- Santa Monica Classic
- Rose Bowl Half Marathon & 5K
- ASICS LA Marathon

## Asset handling

All logo and image resources referenced by the HTML are included in `assets/` and use relative paths. This makes them load reliably on GitHub Pages.

For production email delivery, email platforms generally require absolute, publicly hosted image URLs. Once deployed through GitHub Pages, update each `src="assets/..."` path to its matching absolute GitHub Pages URL or upload the assets to the marketing CDN.
