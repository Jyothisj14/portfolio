const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/data/data.json');
const indexPath = path.join(__dirname, '../index.html');

console.log('⚡ Starting SSG build process...');

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
let htmlContent = fs.readFileSync(indexPath, 'utf8');

function renderNavLogo(data) {
  const p = data.profile || {};
  return `<span class="logo-mark">${p.initials || ''}</span> ${p.name || ''}`;
}

function renderFooterName(data) {
  const p = data.profile || {};
  return p.name || '';
}

function renderMetadata(data) {
  const p = data.profile || {};
  const title = `${p.name} — ${p.title}`;
  const description = p.metaDescription || `Portfolio of ${p.name}, ${p.title} based in ${p.location}. ${p.heroSub.replace(/<[^>]*>/g, '')}`;
  const escapeAttribute = value => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const url = p.siteUrl || '';
  const imageUrl = p.photo && url ? new URL(p.photo, url).href : '';
  const knowledgeBase = data.skills?.categories?.flatMap(category => category.items) || [];
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: p.name,
    url,
    jobTitle: p.title,
    worksFor: {
      '@type': 'Organization',
      name: 'A.P. Moller–Maersk'
    },
    alumniOf: (data.background?.education || []).map(education => ({
      '@type': 'EducationalOrganization',
      name: education.institution
    })),
    sameAs: [p.linkedin, p.github].filter(Boolean),
    knowsAbout: knowledgeBase,
    description
  };

  return `
  <title>${escapeAttribute(title)}</title>
  <meta name="description" content="${escapeAttribute(description)}">
  <link rel="canonical" href="${escapeAttribute(url)}">
  <meta name="robots" content="index, follow">
  <meta name="author" content="${escapeAttribute(p.name)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${escapeAttribute(`${p.name} Portfolio`)}">
  <meta property="og:url" content="${escapeAttribute(url)}">
  <meta property="og:title" content="${escapeAttribute(title)}">
  <meta property="og:description" content="${escapeAttribute(description)}">
  ${imageUrl ? `<meta property="og:image" content="${escapeAttribute(imageUrl)}">
  <meta property="og:image:alt" content="${escapeAttribute(`${p.name} — ${p.title}`)}">` : ''}
  <meta name="twitter:card" content="${imageUrl ? 'summary_large_image' : 'summary'}">
  <meta name="twitter:title" content="${escapeAttribute(title)}">
  <meta name="twitter:description" content="${escapeAttribute(description)}">
  ${imageUrl ? `<meta name="twitter:image" content="${escapeAttribute(imageUrl)}">` : ''}
  <script type="application/ld+json">${JSON.stringify(structuredData)}</script>`;
}

function renderHero(data) {
  if (!data.profile) return '';
  const p = data.profile;
  return `
    ${p.status ? `<div class="status-pill reveal in"><span>${p.status}</span></div>` : ''}
    <p class="eyebrow reveal in">${p.eyebrow}</p>
    <h1 class="reveal in">${p.heroHeadline}<span class="role">${p.heroRole}</span></h1>
    <p class="hero-sub reveal in">${p.heroSub}</p>
    <div class="hero-cta reveal in">
      <a href="#experience" class="btn btn-primary">View my work</a>
      ${p.resume ? `
        <a href="${p.resume}" class="btn btn-ghost" download target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span>Resume</span>
        </a>
      ` : ''}
      <a href="mailto:${p.email}" class="btn btn-ghost">Get in touch</a>
    </div>
    <svg class="hero-route" viewBox="0 0 640 180" role="img" aria-label="A girl with long hair and a flowing dress walking across stepping stones">
      <ellipse class="step-stone" style="--step:0" cx="20" cy="166" rx="17" ry="8" transform="rotate(-12 20 166)"/>
      <ellipse class="step-stone" style="--step:1" cx="86" cy="143" rx="16" ry="8" transform="rotate(12 86 143)"/>
      <ellipse class="step-stone" style="--step:2" cx="152" cy="159" rx="17" ry="8" transform="rotate(-10 152 159)"/>
      <ellipse class="step-stone" style="--step:3" cx="218" cy="132" rx="16" ry="8" transform="rotate(12 218 132)"/>
      <ellipse class="step-stone" style="--step:4" cx="284" cy="150" rx="17" ry="8" transform="rotate(-12 284 150)"/>
      <ellipse class="step-stone" style="--step:5" cx="350" cy="124" rx="16" ry="8" transform="rotate(10 350 124)"/>
      <ellipse class="step-stone" style="--step:6" cx="416" cy="141" rx="17" ry="8" transform="rotate(-12 416 141)"/>
      <ellipse class="step-stone" style="--step:7" cx="482" cy="116" rx="16" ry="8" transform="rotate(12 482 116)"/>
      <ellipse class="step-stone" style="--step:8" cx="548" cy="133" rx="17" ry="8" transform="rotate(-10 548 133)"/>
      <ellipse class="step-stone" style="--step:9" cx="614" cy="109" rx="16" ry="8" transform="rotate(10 614 109)"/>
      <g class="walker-motion" aria-hidden="true">
        <animateMotion class="walker-travel" dur="10s" repeatCount="indefinite" calcMode="paced" rotate="0" path="M20 166 L86 143 L152 159 L218 132 L284 150 L350 124 L416 141 L482 116 L548 133 L614 109"/>
        <g class="walker">
          <animateTransform attributeName="transform" type="translate" values="0 0;0 -2;0 0;0 -2;0 0" dur="0.7s" repeatCount="indefinite"/>
          <path class="walker-hair-long" d="M-7 -71Q-13 -67-12 -56L-14 -35Q-14 -25-10 -17L-5 -22L-5 -49Q-4 -60 0 -63Q5 -60 6 -51L5 -20L11 -16Q15 -25 13 -38L12 -58Q11 -68 6 -71Z"/>
          <path class="walker-leg" d="M-3 -15 Q-7 -8 -10 -2 L-14 0">
            <animateTransform attributeName="transform" type="rotate" values="-24 -3 -15;20 -3 -15;-24 -3 -15" dur="0.7s" repeatCount="indefinite"/>
          </path>
          <path class="walker-leg" d="M3 -15 Q7 -8 10 -2 L14 0">
            <animateTransform attributeName="transform" type="rotate" values="20 3 -15;-24 3 -15;20 3 -15" dur="0.7s" repeatCount="indefinite"/>
          </path>
          <path class="walker-shoe" d="M-14 0l-5 1m33-1 5 1"/>
          <path class="walker-arm" d="M-5 -52Q-10 -45-12 -38L-15 -27">
            <animateTransform attributeName="transform" type="rotate" values="18 -5 -52;-18 -5 -52;18 -5 -52" dur="0.7s" repeatCount="indefinite"/>
          </path>
          <path class="walker-arm" d="M5 -52Q10 -45 12 -38L15 -27">
            <animateTransform attributeName="transform" type="rotate" values="-18 5 -52;18 5 -52;-18 5 -52" dur="0.7s" repeatCount="indefinite"/>
          </path>
          <path class="walker-dress" d="M-5 -55Q0 -58 5 -55L8 -47L7 -39Q12 -29 16 -15Q0 -12-16 -15Q-12 -29-7 -39L-8 -47Z"/>
          <path class="walker-dress-panel" d="M-2 -38L-8 -16M2 -38L8 -16M-7 -39Q0 -36 7 -39"/>
          <path class="walker-neck" d="M-2 -62v6h4v-6"/>
          <ellipse class="walker-head" cx="0" cy="-69" rx="6.5" ry="7.5"/>
          <path class="walker-hair-cap" d="M-7 -68Q-8 -77 0 -78Q8 -77 7 -68L5 -64Q4 -69 1 -70Q-2 -67-5 -64Z"/>
          <path class="walker-hair-detail" d="M-10 -58Q-11 -42-8 -29M10 -58Q11 -43 9 -28"/>
          <circle class="walker-eye" cx="3" cy="-69" r="0.7"/>
        </g>
      </g>
    </svg>
  `;
}

function renderAbout(data) {
  if (!data.about) return '';
  const a = data.about;
  const p = data.profile || {};

  const paragraphsHtml = a.paragraphs ? a.paragraphs.map(text => `<p>${text}</p>`).join('\n      ') : '';
  const statsHtml = a.stats ? a.stats.map(s => `
        <div class="stat"><b>${s.value}</b><span>${s.label}</span></div>
  `).join('') : '';
  const portraitHtml = p.photo
    ? `<img id="profileImg" src="${p.photo}" alt="${p.name || 'Profile'}" loading="lazy" decoding="async">`
    : `<span class="profile-initials">${p.initials || ''}</span>
      <span class="profile-card-name">${p.name || ''}</span>
      <span class="profile-card-title">${p.title || ''}</span>
      <span class="profile-card-location">${p.location || ''}</span>`;

  return `
    <div class="about-photo${p.photo ? '' : ' profile-card'} reveal" aria-label="${p.name}, ${p.title}">
      ${portraitHtml}
    </div>
    <div class="about-text reveal">
      <p class="eyebrow">${a.eyebrow || 'About'}</p>
      ${paragraphsHtml}
      <div class="about-stats">
        ${statsHtml}
      </div>
    </div>
  `;
}

function renderExperience(data) {
  if (!data.experience) return '';
  const exp = data.experience;

  const jobsHtml = exp.jobs ? exp.jobs.map(job => `
      <div class="timeline-item reveal">
        <div class="timeline-dot"></div>
        <div class="timeline-card">
          <div class="role-row">
            <h3>${job.role}</h3>
            <span class="role-date">${job.date}</span>
          </div>
          <span class="role-company">${job.company}</span>
          <ul class="role-list">
            ${job.highlights ? job.highlights.map(h => `<li>${h}</li>`).join('\n            ') : ''}
          </ul>
        </div>
      </div>
  `).join('') : '';

  return `
    <div class="section-head reveal">
      <p class="eyebrow">${exp.eyebrow || 'Experience'}</p>
      <h2>${exp.title}</h2>
      <p>${exp.subtitle}</p>
    </div>
    <div class="timeline" id="timeline">
      <div class="timeline-progress" id="timelineProgress"></div>
      ${jobsHtml}
    </div>
  `;
}

function renderSkills(data) {
  if (!data.skills) return '';
  const s = data.skills;

  const categoriesHtml = s.categories ? s.categories.map(cat => `
      <div class="skill-group reveal">
        <h3>${cat.name}</h3>
        <div class="chip-row">
          ${cat.items ? cat.items.map(item => `<span class="chip">${item}</span>`).join('\n          ') : ''}
        </div>
      </div>
  `).join('') : '';

  return `
    <div class="section-head reveal">
      <p class="eyebrow">${s.eyebrow || 'Skills'}</p>
      <h2>${s.title}</h2>
      <p>${s.subtitle}</p>
    </div>
    <div class="skills-grid">
      ${categoriesHtml}
    </div>
  `;
}

function renderProjects(data) {
  if (!data.projects) return '';
  const proj = data.projects;

  const projectsHtml = proj.items ? proj.items.map(item => `
      <div class="project-card reveal">
        <div class="project-top">
          <h3>${item.title}</h3>
          <div class="project-links">
            ${item.github ? `
              <a class="icon-link" href="${item.github}" target="_blank" rel="noopener" aria-label="View source on GitHub" title="View source on GitHub">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.7.1-.7 1.3.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.3 3.6 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.3-3.2-.1-.3-.6-1.6.1-3.2 0 0 1-.3 3.4 1.2a11.8 11.8 0 0 1 6.2 0c2.4-1.5 3.4-1.2 3.4-1.2.7 1.6.2 2.9.1 3.2.8.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z"/></svg>
              </a>
            ` : ''}
            ${item.demo ? `
              <a class="icon-link" href="${item.demo}" target="_blank" rel="noopener" aria-label="View live demo" title="View live demo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            ` : ''}
          </div>
        </div>
        <p class="desc">${item.description}</p>
        <div class="project-tags">
          ${item.tags ? item.tags.map(tag => `<span class="tag">${tag}</span>`).join('\n          ') : ''}
        </div>
      </div>
  `).join('') : '';

  return `
    <div class="section-head reveal">
      <p class="eyebrow">${proj.eyebrow || 'Projects'}</p>
      <h2>${proj.title}</h2>
      <p>${proj.subtitle}</p>
    </div>
    <div class="projects-grid">
      ${projectsHtml}
    </div>
  `;
}

function renderBackground(data) {
  if (!data.background) return '';
  const bg = data.background;

  const eduHtml = bg.education ? bg.education.map(e => `
        <div class="edu-item">
          <h4 class="edu-degree">${e.degree || 'Degree'}</h4>
            <div class="edu-institution">${e.institution || 'Institution'}</div>
          <div class="edu-meta">
            ${e.grade ? `<span class="edu-badge">${e.grade}</span>` : (e.details ? `<span class="edu-badge">${e.details}</span>` : '')}
            ${e.period ? `<span class="edu-date">${e.period}</span>` : ''}
          </div>
        </div>
  `).join('') : '';

  const certsHtml = bg.certifications ? bg.certifications.map(c => `
        <li class="cert-card-item">
          <div class="cert-info">
            <b class="cert-title">${c.title}</b>
            <span class="cert-issuer">${c.issuer}</span>
          </div>
          ${c.link ? `
            <a href="${c.link}" target="_blank" rel="noopener" class="cert-link" title="Verify Certificate" aria-label="Verify certificate for ${c.title}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="13" height="13"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              <span>Verify</span>
            </a>
          ` : ''}
        </li>
  `).join('') : '';
  const languagesHtml = bg.languages ? bg.languages.map(language => `
          <span class="chip">${language}</span>
  `).join('') : '';

  const achHtml = bg.achievements ? bg.achievements.map(a => {
    let linksHtml = '';
    if (a.link) {
      linksHtml = `
            <div style="margin-top:8px;">
              <a href="${a.link}" target="_blank" rel="noopener" class="cert-link" title="Verify Certificate">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="13" height="13"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                <span>Verify</span>
              </a>
            </div>
      `;
    } else if (a.links && a.links.length > 0) {
      linksHtml = `<div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">` + a.links.map(l => `
            <a href="${l.url}" target="_blank" rel="noopener" class="cert-link" title="${l.label}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="13" height="13"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              <span>${l.label}</span>
            </a>
      `).join('') + `</div>`;
    }

    return `
        <div class="achievement-row">
          <div class="achievement-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>
          <div class="achievement-body">
            <div class="achievement-header">
              <b class="achievement-title">${a.title}</b>
              <span class="achievement-issuer">${a.issuer}</span>
            </div>
            ${a.description ? `<p class="achievement-desc" style="font-size:0.85rem; color:var(--ink-muted); margin-top:4px;">${a.description}</p>` : ''}
            ${linksHtml}
          </div>
        </div>
    `;
  }).join('') : '';

  return `
    <div class="section-head reveal">
      <p class="eyebrow">${bg.eyebrow || 'Background'}</p>
      <h2>${bg.title}</h2>
    </div>
    <div class="background-stack">
      <div class="info-card reveal">
        <h3><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12.5V17c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5"/></svg>Education</h3>
        <div class="edu-list">
          ${eduHtml}
        </div>
      </div>
      <div class="info-card reveal">
        <h3><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="5"/><path d="M8.5 12.5 7 21l5-2.5L17 21l-1.5-8.5"/></svg>Certifications</h3>
        <ul class="cert-grid">
          ${certsHtml}
        </ul>
      </div>
      <div class="info-card reveal">
        <h3><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2 4 5v6c0 5 3.4 8.6 8 11 4.6-2.4 8-6 8-11V5l-8-3Z"/></svg>Achievements</h3>
        <div class="achievements-list">
          ${achHtml}
        </div>
      </div>
      <div class="info-card reveal">
        <h3><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"/></svg>Languages</h3>
        <div class="chip-row">
          ${languagesHtml}
        </div>
      </div>
    </div>
  `;
}

function renderContact(data) {
  if (!data.contact) return '';
  const c = data.contact;
  const p = data.profile || {};

  return `
    <p class="eyebrow" style="justify-content:center;">${c.eyebrow || 'Contact'}</p>
    <h2 class="reveal">${c.title}</h2>
    <p class="reveal">${c.subtitle}</p>
    <div class="contact-links reveal">
      ${p.email ? `<a class="btn btn-primary" href="mailto:${p.email}">${p.email}</a>` : ''}
      ${p.resume ? `<a class="btn btn-ghost" href="${p.resume}" download target="_blank" rel="noopener">Resume PDF</a>` : ''}
      ${p.phone ? `<a class="btn btn-ghost" href="tel:${p.phoneRaw || p.phone}">${p.phone}</a>` : ''}
      ${p.linkedin ? `<a class="btn btn-ghost" href="${p.linkedin}" target="_blank" rel="noopener">LinkedIn</a>` : ''}
      ${p.github ? `<a class="btn btn-ghost" href="${p.github}" target="_blank" rel="noopener">GitHub</a>` : ''}
    </div>
  `;
}

function replaceSection(content, containerId, innerMarkup, startMarker, endMarker) {
  const markerRegex = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`, 'g');
  if (markerRegex.test(content)) {
    return content.replace(markerRegex, `${startMarker}\n${innerMarkup.trim()}\n${endMarker}`);
  }

  const containerRegex = new RegExp(`(<[a-z0-9]+[^>]*id="${containerId}"[^>]*>)([\\s\\S]*?)(<\\/[a-z0-9]+>)`, 'i');
  if (containerRegex.test(content)) {
    return content.replace(containerRegex, `$1\n${startMarker}\n${innerMarkup.trim()}\n${endMarker}\n$3`);
  }

  return content;
}

// Perform section pre-render replacements
htmlContent = replaceSection(htmlContent, 'navLogo', renderNavLogo(data), '<!-- NAV_LOGO_START -->', '<!-- NAV_LOGO_END -->');
htmlContent = replaceSection(htmlContent, 'heroContent', renderHero(data), '<!-- HERO_START -->', '<!-- HERO_END -->');
htmlContent = replaceSection(htmlContent, 'aboutContent', renderAbout(data), '<!-- ABOUT_START -->', '<!-- ABOUT_END -->');
htmlContent = replaceSection(htmlContent, 'experienceContent', renderExperience(data), '<!-- EXPERIENCE_START -->', '<!-- EXPERIENCE_END -->');
htmlContent = replaceSection(htmlContent, 'skillsContent', renderSkills(data), '<!-- SKILLS_START -->', '<!-- SKILLS_END -->');
htmlContent = replaceSection(htmlContent, 'projectsContent', renderProjects(data), '<!-- PROJECTS_START -->', '<!-- PROJECTS_END -->');
htmlContent = replaceSection(htmlContent, 'backgroundContent', renderBackground(data), '<!-- BACKGROUND_START -->', '<!-- BACKGROUND_END -->');
htmlContent = replaceSection(htmlContent, 'contactContent', renderContact(data), '<!-- CONTACT_START -->', '<!-- CONTACT_END -->');
htmlContent = htmlContent.replace(/<!-- SITE_METADATA_START -->[\s\S]*?<!-- SITE_METADATA_END -->/, `<!-- SITE_METADATA_START -->\n${renderMetadata(data).trim()}\n  <!-- SITE_METADATA_END -->`);

// Replace footer name and year
const footerNameRegex = /<span id="footerName">[\s\S]*?<\/span>/i;
if (footerNameRegex.test(htmlContent)) {
  htmlContent = htmlContent.replace(footerNameRegex, `<span id="footerName">${renderFooterName(data)}</span>`);
}

const yearRegex = /<span id="year">[\s\S]*?<\/span>/i;
const currentYear = new Date().getFullYear();
if (yearRegex.test(htmlContent)) {
  htmlContent = htmlContent.replace(yearRegex, `<span id="year">${currentYear}</span>`);
}

// Embed the local portfolio knowledge base for the on-page assistant.
const kbPath = path.join(__dirname, '../src/data/knowledge-base.json');
if (fs.existsSync(kbPath)) {
  const kbData = JSON.parse(fs.readFileSync(kbPath, 'utf8'));
  const translationsPath = path.join(__dirname, '../src/data/translations.de.json');
  const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));
  const kbScript = `<script>window.PORTFOLIO_KB = ${JSON.stringify(kbData)}; window.PORTFOLIO_TRANSLATIONS = { de: ${JSON.stringify(translations)} };</script>\n<script src="src/js/script.js" defer></script>`;

  // Strip old injected scripts if present.
  htmlContent = htmlContent.replace(/<script>window\.PORTFOLIO_KB = [\s\S]*?<\/script>\s*/g, '');
  htmlContent = htmlContent.replace(/<script>window\.AI_PROXY_URL = [\s\S]*?<\/script>\s*/g, '');
  htmlContent = htmlContent.replace(/<script>window\.DEFAULT_GEMINI_KEY = [\s\S]*?<\/script>\s*/g, '');

  htmlContent = htmlContent.replace(/<script\s+src="src\/js\/script\.js"\s+defer><\/script>/gi, kbScript);
}

htmlContent = htmlContent.replace(/[ \t]+$/gm, '');
fs.writeFileSync(indexPath, htmlContent, 'utf8');

// Update sitemap.xml lastmod date with ISO timestamp
const sitemapPath = path.join(__dirname, '../sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  let sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const nowISO = new Date().toISOString();
  sitemap = sitemap.replace(/<loc>.*?<\/loc>/, `<loc>${data.profile.siteUrl}</loc>`);
  sitemap = sitemap.replace(/<lastmod>.*?<\/lastmod>/, `<lastmod>${nowISO}</lastmod>`);
  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
}

// Update robots.txt timestamp header & AI bot permissions
const robotsPath = path.join(__dirname, '../robots.txt');
if (fs.existsSync(robotsPath)) {
  const nowISO = new Date().toISOString();
  const robotsContent = `# Last updated: ${nowISO}
User-agent: *
Allow: /
Sitemap: ${data.profile.siteUrl}sitemap.xml
`;
  fs.writeFileSync(robotsPath, robotsContent, 'utf8');
}

// Generate a text summary for search and AI indexing.
const llmsPath = path.join(__dirname, '../llms.txt');
if (fs.existsSync(kbPath)) {
  const kbData = JSON.parse(fs.readFileSync(kbPath, 'utf8'));
  const p = kbData.profile || {};
  const c = kbData.contact || {};
  const edu = kbData.education || {};
  const expList = kbData.experience || [];
  const certs = kbData.certifications || [];
  const ach = kbData.achievements || [];
  const skills = kbData.skills || {};
  const projects = kbData.projects || [];

  const llmsContent = `# ${p.name} — ${p.title}

> ${p.summary}

## Summary & Contact
- **Name**: ${p.name}
- **Title**: ${p.title}
- **Location**: ${p.location}
- **Education**: ${edu.degree}, ${edu.institution}
- **Email**: ${c.email}
- **Phone**: ${c.phone}
- **Links**: [LinkedIn](${c.linkedin}) | [GitHub](${c.github}) | [Portfolio](${c.portfolio})

## Core Technical Skills
- **Languages**: ${(skills.languages || []).join(', ')}
- **Backend & APIs**: ${(skills.backendAndApis || []).join(', ')}
- **Cloud, DevOps & Testing**: ${(skills.cloudDevOpsTesting || []).join(', ')}

## Featured Projects
${projects.map(proj => `### ${proj.name}
- **Description**: ${proj.description}
${proj.highlights ? proj.highlights.map(h => `- ${h}`).join('\n') + '\n' : ''}- **Links**: ${proj.links ? Object.entries(proj.links).map(([k, v]) => `[${k}](${v})`).join(' | ') : 'N/A'}`).join('\n\n')}

## Professional Experience
${expList.map(job => `### ${job.role} — ${job.company} (${job.period} | ${job.location})
${(job.highlights || []).map(h => `- ${h}`).join('\n')}`).join('\n\n')}

## Certifications
${certs.map(cert => `- **${cert.title}** (${cert.issuer})`).join('\n')}

## Achievements
${ach.map(item => `- **${item.title}** (${item.issuer}): ${item.description || ''}`).join('\n')}

## Languages
${(kbData.languages || []).join(', ')}
`;

  fs.writeFileSync(llmsPath, llmsContent, 'utf8');
}

console.log('✅ SSG build complete! Pre-rendered index.html, sitemap.xml, robots.txt, and llms.txt.');
