# Farm SOP Landing Page

Professional B2B landing page for SOP (Standard Operating Procedures) implementation services for farms in Thailand.

## Overview

This landing page targets farm owners and managers who want to improve their operations through gradual SOP implementation without requiring full GACP certification.

## Features

- **Clean, professional design** - Calm, trustworthy aesthetic without aggressive marketing
- **Multi-language support** - Built-in Google Translate for EN, TH, CN, VN
- **Mobile responsive** - Fully optimized for all devices
- **Contact form** - Lead generation with comprehensive farm details
- **Clear value proposition** - Focuses on practical benefits and step-by-step approach

## Sections

1. **Hero** - Main value proposition and CTA
2. **Benefits** - Why implement SOPs (6 key benefits)
3. **Our Approach** - 6-step process explanation
4. **Common SOPs** - Categorized list of typical procedures
5. **Contact Form** - Lead capture with farm-specific fields
6. **Footer** - Navigation and contact information

## Tech Stack

- Pure HTML5, CSS3, JavaScript (no frameworks)
- Google Translate API for multi-language
- Responsive grid layouts
- CSS custom properties for theming

## Target Audience

- Farm owners and managers in Thailand
- Agricultural businesses seeking quality improvement
- Operations looking to scale systematically
- Farms considering future certification

## Tone & Messaging

- Professional but approachable
- Practical, not theoretical
- No empty promises or hype
- Focus on gradual implementation
- Emphasis on real-world adaptation

## Setup

### Local Development

1. Open `index.html` in a browser
2. No build process required
3. All assets are self-contained

### GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages:

1. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: "GitHub Actions"
   
2. **Automatic Deployment:**
   - Every push to `main` branch triggers automatic deployment
   - GitHub Actions workflow: `.github/workflows/deploy.yml`

3. **Manual Deployment:**
   - Go to Actions tab
   - Run "Deploy to GitHub Pages" workflow manually

4. **Access your site:**
   - URL: `https://ifnoise.github.io/landing-sop/`
   - Custom domain: Add `CNAME` file with your domain

**Note:** `.nojekyll` file disables Jekyll processing for faster deployments.

## Customization

- Colors: Edit CSS variables in `styles.css`
- Content: All text is in `index.html`
- Form handling: Configure in `script.js`

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS/Android)

## File Structure

```
/landing
├── index.html          # Main landing page
├── styles.css          # Styling
├── script.js           # Interactions & form handling
├── README.md           # This file
└── PROMPT.md           # Original project requirements
```

## Notes

- This is a static landing page
- Form submissions currently log to console
- Integrate with your backend/CRM for production use
- Old files preserved as *_old.* for reference

---

**Target Markets:** Thailand, Southeast Asia  
**Languages:** English (primary), Thai, Chinese, Vietnamese (via Google Translate)  
**Last Updated:** January 2025
