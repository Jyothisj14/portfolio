const root = document.documentElement;
const languageToggle = document.getElementById('languageToggle');
const portfolioTranslations = window.PORTFOLIO_TRANSLATIONS || {};
const originalPortfolioText = new WeakMap();
const originalPortfolioAttributes = new WeakMap();
const originalPageTitle = document.title;
let currentLanguage = localStorage.getItem('portfolio-language') === 'de' ? 'de' : 'en';

function translatePortfolioText(value, language = currentLanguage) {
  const german = portfolioTranslations.de || {};
  if (language === 'de') return german[value] || value;
  const english = Object.entries(german).find(([, translation]) => translation === value);
  return english ? english[0] : value;
}

function applyPortfolioLanguage(language) {
  currentLanguage = language === 'de' ? 'de' : 'en';
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: node => node.parentElement?.closest('script, style')
      ? NodeFilter.FILTER_REJECT
      : NodeFilter.FILTER_ACCEPT
  });
  let textNode;
  while ((textNode = walker.nextNode())) {
    if (!originalPortfolioText.has(textNode)) originalPortfolioText.set(textNode, textNode.nodeValue);
    const original = originalPortfolioText.get(textNode);
    const trimmed = original.trim();
    if (!trimmed) continue;
    const normalized = trimmed.replace(/\s+/g, ' ');
    const translated = currentLanguage === 'de' ? (portfolioTranslations.de?.[normalized] || normalized) : trimmed;
    const start = original.indexOf(trimmed);
    textNode.nodeValue = `${original.slice(0, start)}${translated}${original.slice(start + trimmed.length)}`;
  }

  document.querySelectorAll('[aria-label], [title], [placeholder], [data-prompt]').forEach(element => {
    if (!originalPortfolioAttributes.has(element)) originalPortfolioAttributes.set(element, {});
    const originalAttributes = originalPortfolioAttributes.get(element);
    ['aria-label', 'title', 'placeholder', 'data-prompt'].forEach(attribute => {
      const value = element.getAttribute(attribute);
      if (value && !(attribute in originalAttributes)) originalAttributes[attribute] = value;
      const original = originalAttributes[attribute];
      if (original) {
        element.setAttribute(attribute, currentLanguage === 'de'
          ? (portfolioTranslations.de?.[original] || original)
          : original);
      }
    });
  });

  root.lang = currentLanguage;
  if (languageToggle) {
    const nextLanguage = currentLanguage === 'de' ? 'en' : 'de';
    languageToggle.textContent = nextLanguage.toUpperCase();
    languageToggle.lang = nextLanguage;
    const label = nextLanguage === 'de' ? 'Change language to German' : 'Change language to English';
    languageToggle.setAttribute('aria-label', translatePortfolioText(label));
    languageToggle.title = translatePortfolioText(label);
  }
  document.title = currentLanguage === 'de'
    ? (portfolioTranslations.de?.[originalPageTitle] || originalPageTitle)
    : originalPageTitle;
  localStorage.setItem('portfolio-language', currentLanguage);
  window.PORTFOLIO_LANGUAGE = currentLanguage;
}

if (languageToggle) {
  languageToggle.addEventListener('click', () => {
    applyPortfolioLanguage(currentLanguage === 'de' ? 'en' : 'de');
  });
}
applyPortfolioLanguage(currentLanguage);

const themeToggle = document.getElementById('themeToggle');
const storedTheme = localStorage.getItem('portfolio-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
root.setAttribute('data-theme', storedTheme || (prefersDark ? 'dark' : 'light'));

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
  });
}

const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal:not(.in)');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(element => observer.observe(element));
}

function initTimelineProgress() {
  const timeline = document.getElementById('timeline');
  const progress = document.getElementById('timelineProgress');
  if (!timeline || !progress) return;

  function updateProgress() {
    const rect = timeline.getBoundingClientRect();
    const visible = Math.min(Math.max(window.innerHeight * 0.75 - rect.top, 0), rect.height);
    progress.style.height = `${Math.min((visible / rect.height) * 100, 100)}%`;
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
}

function initWalkerMotion() {
  const route = document.querySelector('.hero-route');
  if (!route?.pauseAnimations || !route.unpauseAnimations) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const syncMotionPreference = () => {
    if (reducedMotion.matches) route.pauseAnimations();
    else route.unpauseAnimations();
  };

  syncMotionPreference();
  reducedMotion.addEventListener('change', syncMotionPreference);
}

function initScrollspy() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !links.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  }, { threshold: 0.3 });
  sections.forEach(section => observer.observe(section));
}

function initBackToTop() {
  const button = document.getElementById('backToTop');
  if (!button) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) button.removeAttribute('hidden');
    else button.setAttribute('hidden', 'true');
  }, { passive: true });
}

function initCopyEmailToast() {
  const toast = document.getElementById('toast');
  const emailLink = document.querySelector('a[href^="mailto:"]');
  if (!toast || !emailLink || !navigator.clipboard) return;

  emailLink.addEventListener('click', () => {
    navigator.clipboard.writeText(emailLink.href.replace('mailto:', '')).then(() => {
      toast.textContent = translatePortfolioText('Email copied to clipboard');
      toast.removeAttribute('hidden');
      window.setTimeout(() => toast.setAttribute('hidden', 'true'), 2200);
    }).catch(error => {
      console.error('Unable to copy email address:', error);
    });
  });
}

function initPortfolioAssistant() {
  const toggle = document.getElementById('aiChatToggle');
  const chatWindow = document.getElementById('aiChatWindow');
  const closeButton = document.getElementById('aiChatClose');
  const messages = document.getElementById('aiChatMessages');
  const form = document.getElementById('aiChatForm');
  const input = document.getElementById('aiChatInput');
  const kb = window.PORTFOLIO_KB || {};

  if (!toggle || !chatWindow || !messages || !form || !input) return;

  function toggleWindow() {
    const opening = chatWindow.hasAttribute('hidden');
    if (opening) {
      chatWindow.removeAttribute('hidden');
      input.focus();
    } else {
      chatWindow.setAttribute('hidden', 'true');
    }
  }

  toggle.addEventListener('click', toggleWindow);
  closeButton?.addEventListener('click', () => chatWindow.setAttribute('hidden', 'true'));

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }

  function createResponse(query) {
    const text = query.toLowerCase();
    const profile = kb.profile || {};
    const contact = kb.contact || {};
    const german = window.PORTFOLIO_LANGUAGE === 'de';

    if (/contact|email|phone|reach|linkedin|github|kontakt|e-?mail|telefon|erreich/.test(text)) {
      if (german) {
        return `Du kannst Jyothi per E-Mail unter <a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a> kontaktieren oder dich mit ihr auf <a href="${escapeHtml(contact.linkedin)}" target="_blank" rel="noopener">LinkedIn</a> und <a href="${escapeHtml(contact.github)}" target="_blank" rel="noopener">GitHub</a> vernetzen.`;
      }
      return `You can contact Jyothi at <a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a> or connect on <a href="${escapeHtml(contact.linkedin)}" target="_blank" rel="noopener">LinkedIn</a> and <a href="${escapeHtml(contact.github)}" target="_blank" rel="noopener">GitHub</a>.`;
    }

    if (/education|study|degree|university|chemnitz|ausbildung|studium|studier|abschluss|universität/.test(text)) {
      const education = kb.education || {};
      if (german) {
        return `Jyothi studiert ${escapeHtml(education.degree)} an der ${escapeHtml(education.institution)} (${escapeHtml(education.graduated)}). Außerdem hat sie einen Bachelorabschluss in Elektronik und Kommunikationstechnik der Visvesvaraya Technological University.`;
      }
      return `Jyothi is pursuing ${escapeHtml(education.degree)} at ${escapeHtml(education.institution)} (${escapeHtml(education.graduated)}). She also holds a B.E. in Electronics and Communication Engineering from Visvesvaraya Technological University.`;
    }

    if (/project|projekt/.test(text)) {
      const projects = (kb.projects || []).map(project => `<strong>${escapeHtml(project.name)}</strong> — ${escapeHtml(german ? translatePortfolioText(project.description) : project.description)}`).join('<br><br>');
      return german ? `Ausgewählte Projekte:<br>${projects}` : `Selected projects include: ${projects}`;
    }

    if (/skill|stack|technology|tech|kubernetes|java|spring|devops|cloud|kenntnis|fähigkeiten|technologie/.test(text)) {
      const skills = kb.skills || {};
      const skillGroups = [
        [german ? 'Backend & APIs' : 'Backend', skills.backendAndApis],
        ['Cloud & DevOps', skills.cloudDevOpsTesting],
        [german ? 'Programmiersprachen' : 'Languages', skills.languages]
      ].filter(([, items]) => items?.length);
      const groups = skillGroups.map(([label, items]) => `• <strong>${label}</strong>: ${items.map(escapeHtml).join(', ')}`).join('<br>');
      return german
        ? `Jyothi arbeitet als ${escapeHtml(profile.title)} mit folgenden Technologien:<br>${groups}`
        : `Jyothi works with ${escapeHtml(profile.title)} technologies:<br>${groups}`;
    }

    if (/available|working student|werkstudent|hours|hire|verfügbar|stunden|einstellen/.test(text)) {
      if (german) return 'Jyothi ist ab sofort für eine Werkstudentinnenstelle in DevOps, Cloud oder Backend-Engineering verfügbar – während des Semesters bis zu 20 Stunden pro Woche.';
      return 'Jyothi is immediately available for a working student (Werkstudent) role in DevOps, cloud, or backend engineering, up to 20 hours per week during the semester.';
    }

    if (/workshop|ambassador|beta|award|achievement|botschafter|auszeichnung|erfolg/.test(text)) {
      const ambassador = (kb.experience || []).find(job => /ambassador/i.test(job.role));
      if (german) {
        return ambassador
          ? `<strong>Beta Microsoft Learn Student Ambassador</strong>: ${ambassador.highlights.map(highlight => escapeHtml(translatePortfolioText(highlight))).join('<br>')}`
          : 'Jyothi erreichte die Beta-Stufe als Microsoft Learn Student Ambassador und führte mehr als 15 technische Workshops durch.';
      }
      return ambassador
        ? `<strong>${escapeHtml(ambassador.role)}</strong>: ${ambassador.highlights.map(escapeHtml).join('<br>')}`
        : 'Jyothi advanced to Beta Microsoft Learn Student Ambassador and conducted 15+ technical workshops.';
    }

    if (/experience|work|job|maersk|incident|platform|berufserfahrung|erfahrung|arbeit|vorfall|plattform/.test(text)) {
      const experiences = (kb.experience || []).map(job => `<strong>${escapeHtml(job.role)}</strong> at ${escapeHtml(job.company)} (${escapeHtml(job.period)}): ${escapeHtml(job.highlights?.[0] || '')}`).join('<br><br>');
      if (german) return `Jyothi verfügt über mehr als drei Jahre Erfahrung als Platform- und DevOps-Engineer. Sie studiert Web Engineering an der TU Chemnitz.<br><br>${experiences}`;
      return `${escapeHtml(profile.summary)}<br><br>${experiences}`;
    }

    if (german) return 'Ich helfe dir gern mit Informationen zu Jyothis Berufserfahrung, Kenntnissen, Projekten, Ausbildung, Verfügbarkeit und Kontaktdaten.';
    return `I can help with Jyothi's experience, skills, projects, education, availability, and contact details. ${escapeHtml(profile.summary)}`;
  }

  function addMessage(text, isUser = false) {
    const element = document.createElement('div');
    element.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    element.innerHTML = `<p>${isUser ? escapeHtml(text) : text}</p>`;
    messages.appendChild(element);
    messages.scrollTop = messages.scrollHeight;
  }

  function answer(query) {
    addMessage(query, true);
    addMessage(createResponse(query));
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const query = input.value.trim();
    if (!query) return;
    input.value = '';
    answer(query);
  });

  messages.addEventListener('click', event => {
    const chip = event.target.closest('.chip-btn');
    const prompt = chip?.getAttribute('data-prompt');
    if (prompt) answer(prompt);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initTimelineProgress();
  initWalkerMotion();
  initScrollspy();
  initBackToTop();
  initCopyEmailToast();
  initPortfolioAssistant();

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
});
