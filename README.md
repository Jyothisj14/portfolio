# Jyothi Siddalingappa Jayanna — Portfolio

Portfolio for Jyothi, a Platform and DevOps Engineer and M.Sc. Web Engineering student at TU Chemnitz. The site is a lightweight static website generated with plain HTML, CSS, JavaScript, and Node.js.

## Features

- Pre-rendered portfolio sections for professional experience, skills, projects, education, certifications, and contact details.
- English and German language switcher; the selected language is remembered in the browser.
- Responsive layout with dark/light theme, mobile navigation, scroll reveal, and print styles.
- Local portfolio assistant that answers from the checked-in knowledge base; it sends no data to an external AI service.
- Generated SEO metadata, structured data, sitemap, robots file, and `llms.txt`.
- No runtime or build dependencies.

## Build and preview

After editing portfolio content, the assistant knowledge base, or `src/data/translations.de.json`, regenerate the static page and supporting metadata:

```bash
npm run build
```

Then open `index.html` in a browser, or serve the repository locally:

```bash
python3 -m http.server 8000
```

## Project structure

```text
.
├── assets/
│   ├── favicon.svg
│   └── Jyothi_SJ_CV.pdf
├── scripts/build.js
├── src/
│   ├── css/styles.css
│   ├── data/data.json
│   ├── data/knowledge-base.json
│   ├── data/translations.de.json
│   └── js/script.js
├── index.html
└── 404.html
```

The public portfolio URL configured for canonical metadata and sitemap output is `https://jyothisj14.github.io/portfolio/`.
