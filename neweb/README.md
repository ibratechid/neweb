# NEWEB Digital Solutions — Landing Site

A professional, SEO-optimized, responsive static site for **NEWEB Digital Solutions**.

## Pages
- `index.html` — homepage / landing page
- `services.html` — service detail sections + tiers
- `portfolio.html` — filterable gallery + project modal
- `pricing.html` — comparison table + packages + FAQ
- `blog.html` — searchable/filterable posts + recent posts sidebar
- `contact.html` — validated contact form + local draft persistence

## Tech
- Semantic HTML5
- Mobile-first CSS (no frameworks)
- Vanilla JavaScript (no external dependencies)

## How to run locally
Because the site is static, you can open the HTML files directly. For best results (and to avoid browser restrictions on some features), serve the folder with a simple static server:

```bash
cd neweb
python3 -m http.server 8080
```

Then open: `http://localhost:8080/`

## Dark mode
- Default theme uses `prefers-color-scheme`.
- Manual toggle stores preference in `localStorage` under `neweb.theme`.

## LocalStorage usage (non-sensitive demo storage)
- Newsletter email: `neweb.newsletter.email`
- Newsletter timestamp: `neweb.newsletter.date`
- Contact form draft: `neweb.contact.draft`
- Last portfolio filter: `neweb.portfolio.filter`

> Note: For production, avoid storing personal data unless you have a clear privacy policy and user consent.

## Forms (validation + production readiness)
- Newsletter: client-side email validation; saved locally for demo.
- Contact form:
  - client-side validation
  - basic output sanitization (HTML escaping)
  - includes a hidden `csrf_token` field as a **CSRF-ready** placeholder

To make the contact form production-ready:
1. Point the `<form action>` to a real backend endpoint.
2. Generate and validate a CSRF token server-side.
3. Validate and sanitize inputs server-side (client-side is not sufficient).
4. Return proper HTTP responses and implement rate limiting.

## SEO checklist included
- Unique titles and meta descriptions per page
- Open Graph tags
- JSON-LD structured data (Organization + page-specific types)
- `robots.txt` and `sitemap.xml`

### Update before production
- Replace `https://newebdigitalsolutions.com/` in canonical/OG/sitemap with your real domain.
- Replace placeholder email/phone values.
- Replace placeholder images in `assets/images/`.

## Image optimization guidelines
Before launch, replace placeholders with optimized images:
- Use modern formats when possible (AVIF/WebP), keep a PNG/JPG fallback if needed.
- Compress and resize to the maximum display size (avoid huge originals).
- Provide explicit dimensions or use consistent aspect ratios to prevent layout shift.
- Add descriptive `alt` text for meaningful images.

## Structure
```
neweb/
├── index.html
├── services.html
├── portfolio.html
├── pricing.html
├── blog.html
├── contact.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── assets/
│   ├── images/
│   │   └── placeholder.svg
│   └── icons/
│       ├── icon-webdev.svg
│       ├── icon-management.svg
│       └── icon-seo.svg
├── sitemap.xml
├── robots.txt
└── .gitignore
```

## Minification (optional)
For production, you can minify:
- `css/style.css` → `css/style.min.css`
- `js/script.js` → `js/script.min.js`

Then update the HTML `<link>`/`<script>` tags accordingly.
