# RunDot × LA Marathon Series — registration email embeds

Three responsive, table-based HTML embeds prepared for the event registration-confirmation email flow:

1. Santa Monica Classic 5K/10K — Sunday, September 13, 2026
2. Rose Bowl Half Marathon & 5K — Sunday, January 17, 2027
3. ASICS LA Marathon — Sunday, March 7, 2027

## Confirmed against the supplied brief

- [First Name] is the only personalization field used.
- Each CTA uses its specified attribution URL: `RUNLAM3` for Santa Monica Classic and ASICS LA Marathon; `RUNRBH` for Rose Bowl.
- Event-specific CTA copy, race dates, free-plan language, offer details, closing copy, and image alt text follow the brief.
- Every email contains visible RunDot and event branding plus **Official Digital Training Platform of the LA Marathon Race Series**.
- All images and marks are local files in `assets/`, with relative paths validated before publishing.

## Production note

These are preview-ready HTML files. Before placing an embed in the registration platform, replace `assets/...` image paths with absolute URLs on the final asset host (GitHub Pages or the marketing CDN). Email clients require publicly reachable absolute image URLs.
