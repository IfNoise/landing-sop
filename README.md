# Cannabis Farm SOP Landing Page

Professional B2B landing page for SOP (Standard Operating Procedures) implementation services for cannabis farms in Thailand, focusing on protected cultivation (greenhouse/indoor).

## 🌿 Overview

Landing page for cannabis farm operators seeking to improve operations through systematic SOP implementation. Specialized for protected cultivation environments (greenhouses, indoor facilities).

## ✨ Features

- **Cannabis-focused** - Cultivation scale in m² and plant count
- **Multi-language** - Google Translate (EN, TH, CN, VI, RU)
- **Mobile responsive** - Optimized for all devices
- **Google Sheets integration** - Direct form submissions to spreadsheet
- **Email notifications** - Automatic alerts for new leads
- **Security** - Honeypot anti-bot, data validation, sanitization

## 📋 Sections

1. **Hero** - Value proposition for cannabis operations
2. **Benefits** - 6 key advantages of SOP implementation
3. **Approach** - 6-step implementation process
4. **Common SOPs** - Categorized procedures (Cultivation, Processing, Quality, etc.)
5. **Contact Form** - Lead capture with cannabis-specific fields:
   - Growing Environment (Greenhouse/Indoor/Outdoor/Hybrid)
   - Cultivation Scale (m² and plant count)
6. **Footer** - Navigation and contact info

## 🛠 Tech Stack

- **Frontend**: Pure HTML5, CSS3, Vanilla JavaScript
- **Backend**: Google Apps Script + Google Sheets
- **Deployment**: GitHub Pages (automatic via GitHub Actions)
- **Translation**: Google Translate Widget
- **Form**: Direct integration with Google Sheets API

## 🎯 Target Audience

- Cannabis farm owners/managers in Thailand
- Protected cultivation operations (greenhouse/indoor)
- Facilities ranging from 100m² to 5,000m²+
- Operations with 200 to 15,000+ plants

## Setup

### Local Development

1. Open `index.html` in a browser
2. No build process required
## 🚀 Quick Start

### 1. Local Development
```bash
# Clone repository
git clone https://github.com/IfNoise/landing-sop.git
cd landing-sop

# Open in browser
open index.html
```

### 2. Google Sheets Integration

**Create Google Apps Script:**
1. Create new Google Sheet
2. Extensions → Apps Script
3. Copy this simplified code:

```javascript
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
const NOTIFICATION_EMAIL = 'your@email.com';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Validate
    if (!data.name || !data.email || !data.message) {
      return createResponse(false, 'Missing fields');
    }
    
    // Honeypot
    if (data.website) {
      return createResponse(false, 'Bot detected');
    }
    
    // Save to sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Заявки');
    sheet.appendRow([
      new Date(data.timestamp),
      data.name || '',
      data.farm || '',
      data.email || '',
      data.phone || '',
      data['farm-type'] || '',
      data['farm-size'] || '',
      data.message || ''
    ]);
    
    // Send email
    if (NOTIFICATION_EMAIL) {
      MailApp.sendEmail(NOTIFICATION_EMAIL, '🌾 Новая заявка', JSON.stringify(data, null, 2));
    }
    
    return createResponse(true, 'Success');
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

function createResponse(success, message) {
  return ContentService
    .createTextOutput(JSON.stringify({ success, message }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Deploy → New deployment → Web app:
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy web app URL
6. Update `GOOGLE_SCRIPT_URL` in `script.js`

**Setup Sheet:**
Create sheet named "Заявки" with headers:
```
Дата и время | Имя | Название фермы | Email | Телефон | Тип фермы | Размер фермы | Сообщение
```

### 3. Deploy to GitHub Pages

Already configured! Just:
1. Push to `main` branch
2. GitHub Actions auto-deploys
3. Live at: https://ifnoise.github.io/landing-sop/

## 📁 File Structure

```
/landing-sop
├── index.html                    # Main page
├── styles.css                    # Styles with cannabis focus
├── styles-features.css           # Additional feature styles
├── script.js                     # Form handling (no-cors mode)
├── .github/workflows/deploy.yml  # Auto-deployment
├── .nojekyll                     # Skip Jekyll processing
├── PROMPT.md                     # Original requirements
└── README.md                     # This file
```

## 🔧 Configuration

**Form Fields:**
- Name (required)
- Farm Name (optional)
- Email (required, validated)
- Phone (optional)
- Growing Environment: Greenhouse/Indoor/Outdoor/Hybrid
- Cultivation Scale: Micro/Small/Medium/Large/Commercial (in m² and plants)
- Message (required)
- Website (honeypot, hidden)

**Security:**
- Honeypot field for bot protection
- Email regex validation
- Data sanitization in Apps Script
- Max text length: 1000 chars

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS/Android)

## 📝 Customization

- **Colors**: Edit CSS variables in `styles.css` (green cannabis theme)
- **Content**: All text in `index.html`
- **Form logic**: `script.js` with no-cors mode for Google Apps Script

---

**Live Site:** https://ifnoise.github.io/landing-sop/  
**Target Market:** Thailand cannabis cultivation  
**Languages:** EN, TH, CN, VI, RU (Google Translate)  
**Last Updated:** January 2026
