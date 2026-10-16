# VikKreative Portfolio

A lightweight portfolio website for a creative product and visual designer. The project is built as a static site using HTML, CSS, and JavaScript, with portfolio content stored in a central JavaScript config file and optional Supabase-powered content management for the admin area.

## Overview

This project presents:
- a homepage with hero, featured work, services, and contact section
- project detail pages for individual case studies
- an about page
- an admin dashboard for managing portfolio content
- a simple SEO-friendly static setup

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Supabase for CMS/data layer
- Static hosting friendly setup

## Project Structure

```text
.
├── index.html             # Homepage
├── about.html             # About page
├── project.html           # Project detail page
├── css/
│   └── style.css          # Site styling
├── js/
│   ├── content.js         # Main site content and configuration
│   └── app.js             # Rendering logic for the portfolio
├── admin/
│   ├── index.html         # Admin dashboard
│   ├── admin.js           # Admin logic
│   └── admin.css          # Admin styling
├── images/                # Project and site imagery
├── supabase/              # Optional Supabase-related files or setup
├── robots.txt             # SEO robot rules
├── sitemap.xml            # Sitemap
└── README.md              # Project documentation
```

## How It Works

- `js/content.js` holds the primary content for the site, including:
  - site metadata
  - hero text
  - services
  - project list
  - process steps
  - contact details
- `js/app.js` renders the content into the HTML pages dynamically.
- `project.html` reads the selected project from the URL and displays the matching project details.
- The admin section has been connected to Supabase to deliver content from a database instead of relying only on the static file.


