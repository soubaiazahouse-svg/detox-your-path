# DETOX your Path

**DETOX your Path** by AZA House Company — a bilingual (Arabic / English) self-care website for every woman, at any age, ready to start caring for herself.

## What's inside

A single-page, fully responsive website (`index.html`, no build step, no dependencies) with:

- **Hero** — introduction and calls to action
- **About** — mission, values, and philosophy
- **Programs** — six self-care pillars (physical health, mental wellness, spiritual balance, social connections, self-image & confidence, personal & financial growth)
- **Articles** — six in-depth self-care articles, opened in a modal
- **Community & Share** — native share, WhatsApp, X/Twitter, Facebook, email, and copy-link
- **Testimonials**
- **FAQ** — accordion
- **Contact** — info + a `mailto:` contact form
- **Footer**

## Languages

Arabic (default, RTL) and English (LTR), toggled instantly with the **EN/AR** button in the header — no page reload, and the choice is remembered (`localStorage`).

## Running locally

It's a static site — just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

## Deploying

Since it's a single static HTML file with no backend, it can be published as-is on GitHub Pages, Netlify, Vercel, or any static host — then pointed at a custom domain.
