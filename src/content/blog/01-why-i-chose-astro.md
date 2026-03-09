---
title: 'Why I Chose Astro for My Portfolio'
date: 2026-03-01
description: "After trying Next.js, Remix, and plain HTML, Astro's island architecture finally clicked for me. Here's what made the difference."
tags: ['Astro', 'Performance', 'Web Dev']
---

## I Always Wanted One of These

I've wanted a personal portfolio for years. Not just a GitHub profile or a LinkedIn an actual place on the internet that felt like mine. Every developer I looked up to had one. A little corner of the web with their name on it, their work, their voice.

I never built one. I'd start, get three hours in, decide the stack was wrong, and abandon it. Repeat that cycle a few times and eventually you just stop starting.

This time I gave myself one rule: **ship it**. Figure out the rest after. That forced me to actually pick a stack and commit which is how I landed on Astro.

## Why Not Next.js?

Next.js is brilliant for apps. For a portfolio? It's a lot. The default bundle is heavier than I need, and the App Router mental model while powerful adds cognitive overhead for something that's mostly static content.

I also wanted full control over the HTML structure. With Next.js I always felt like I was fighting the framework to get exactly the markup I wanted.

## Astro's Island Model

Astro's pitch is simple: **ship zero JS by default, opt into interactivity per component**. The `client:load`, `client:idle`, and `client:visible` directives let me be surgical about what runs in the browser.

My portfolio uses exactly two React islands:

- `ProjectScrollShowcase` — scroll-driven Framer Motion animations
- `CatFollower` — the cursor cat (obviously critical)

Everything else is static HTML. The result is a Lighthouse performance score I'm genuinely proud of.

## The DX Is Surprisingly Good

`.astro` files feel like an evolution of templating languages done right. Frontmatter for data fetching, a template below it, scoped styles if you want them. No client/server boundary confusion, no hydration mismatches.

Content collections with Zod schemas mean my project and blog data is type-safe at build time. If I forget a required field, the build fails loudly.

## Would I Recommend It?

For content-heavy sites, portfolios, blogs, or marketing pages **absolutely yes**. For a full SPA with lots of shared client state, probably reach for something else.

The ecosystem is growing fast and the docs are some of the best I've read. Worth a look even if you end up not using it.
