REUSABLE SHUBHAM K MART BAG COMPANION

Copy brand-buddy.js and brand-buddy.css into the same folder on your website.
Before </body>, add:
<script src="/your-folder/brand-buddy.js" defer></script>

Open demo.html to preview, or serve this folder through your local server.
No React, packages, images, API key or paid services are required.
SVG artwork is embedded. Shadow DOM keeps styles isolated from your website.

CONNECT YOUR OWN CHATBOT
window.addEventListener('brand-buddy:activate', () => {
  // Open your existing chat panel here.
});

CUSTOM SETUP (add data-auto="false" to the script tag):
const buddy = window.BrandBuddy.mount({
  label: 'Ask me',
  greeting: 'How can I help?',
  storageKey: 'my-site-buddy',
  onActivate: () => { /* open your chat panel */ }
});
buddy.hide();    // Sleep in bottom-left room
buddy.show();    // Restore outside position
buddy.destroy(); // Remove and clean up listeners/timers

Visible on first visit, on the right. Hidden preference and position remembered.
Mouse/touch dragging, arrow-key movement, pointer-following eyes, blinking,
breathing, idle activities, hover reactions and reduced-motion support included.

This package contains the character widget. Brand answers and voice typing
belong to the separate website chat integration. Connect a chatbot using the
event or callback above. Never place provider API keys in browser JavaScript.
Keep the supplied green/gold identity when reusing it for Shubham K Mart.
