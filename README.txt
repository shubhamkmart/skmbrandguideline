SHUBHAM K MART — DIGITAL BRAND GUIDELINES
React website with 20 independently rendered HTML chapters.

RUN LOCALLY
1. Install Node.js 20.19+ if needed.
2. Open a terminal in this folder.
3. npm install
4. npm run build
5. npm start
6. Open http://localhost:4173

The included dist folder is already built. With Node installed, npm start
serves it without needing npm install. Start-Brand-Guide.cmd does this too.
Do not open index.html directly: the website uses root-relative routes/assets.

EDIT
src/data.js: chapter copy, palette and shared values.
src/App.jsx: React UI, demonstrations and interactions.
src/styles.css: responsive styling and print layout.
npm run check validates the built chapters and local asset/link targets.

PUBLIC HOSTING / CRAWLABILITY
Netlify: connect this repository with its base directory at the repository root.
The included netlify.toml builds the site and publishes dist automatically.
Netlify's main site URL supplies canonical URLs and the sitemap automatically;
SITE_URL can override it when an explicit production origin is needed.
For manual Netlify uploads, upload dist, not the project folder.

All chapter copy and navigation appear in the initial HTML without JavaScript.
Every chapter has a URL, title, description, H1 and CreativeWork structured data.
Real anchor links connect all chapters. robots.txt permits crawling.

For production, set the actual public origin before building (PowerShell):
$env:SITE_URL='https://brand.yourdomain.com'
npm run build
npm run check

This adds self-canonical URLs, absolute sharing metadata and sitemap.xml.
Upload the contents of dist to a public static host supporting directory
index files. Serve unknown URLs as HTTP 404 using 404.html. Do not add a
catch-all rewrite to index.html. Include a TLS certificate. The supplied
Node server is a loopback-only local preview, not a production web server.
A local folder is not accessible to search engines. Actual indexing and
search performance require public hosting and have not been verified.

SOURCES & STATUS
The supplied Digital-Marketing-Guide.pptx (43 slides) is the main digital source.
The Brand-Guidelines.pptx.pdf supplies mission, personality and relevant
digital details. Physical applications are excluded from the website.
Both supplied SVG originals are preserved byte-for-byte in public/assets.
Legacy logo colors differ from proposed palette #3D6948 / #F3CB2D.
The source standards are proposed v1.0, not formally approved brand policy.
Additional grid, margin, banner and safe-area values are labeled proposed.
Source slide references appear at the bottom of each chapter.
Social dimensions are source starting values; verify current platform crops.
Inter is self-hosted; its license is included with the built font assets.
Noto Sans Devanagari is documented as a proposed regional font, not bundled.

INTERACTIONS
The floating brand helper answers questions using the guide through a server-side
Netlify Function at /api/brand-chat. Set GROQ_API_KEY as a production secret in
Netlify environment variables, then deploy. Never put the key in source or public
assets. GROQ_MODEL optionally overrides the default llama-3.3-70b-versatile model.
Questions and the relevant guide excerpts are sent to Groq to produce an answer.
Conversation history stays in page memory and resets on navigation/reload.
For local chat testing, set GROQ_API_KEY in the process environment before npm start.
Static/manual-only uploads serve the guide; the helper needs Netlify Functions.

Search chapter content from the sidebar. Use left/right arrows outside
controls to move between chapters. Click a color to copy its HEX value.
Type into the typography tester. Switch social preview aspect ratios.
Copy CSS/JSON tokens or download them. Download editable SVG templates.
The release checklist tracks progress for the current page session only.
On mobile, open navigation using the menu button. Escape closes it.
Print this chapter produces a clean print view of digital guidance.

VERIFICATION REFERENCE
Google Search Central: JavaScript SEO basics
https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
