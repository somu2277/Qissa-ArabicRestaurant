# Qissa Arabic Restaurant – Premium QR Digital Menu Platform

A production-grade, QR-based digital restaurant menu and discovery platform for **Qissa Arabic Restaurant**. Designed for mobile-first in-restaurant dining, featuring an AI Food Assistant chatbot with image-first recommendations, table-specific QR routing, and an authenticated management dashboard.

---

## 🚀 Live Application Services

| Application | Local Port | Target Production Domain | Technology Stack |
|---|---|---|---|
| **Customer Digital Menu** | `http://localhost:5173` | `menu.restaurantdomain.com` | React 18, Vite, Tailwind CSS, Lucide, Socket.IO Client |
| **Admin Management Portal** | `http://localhost:5174` | `admin.restaurantdomain.com` | React 18, Vite, Tailwind CSS, Lucide, JWT Auth |
| **Shared Backend API** | `http://localhost:5000` | `api.restaurantdomain.com` | Node.js, Express, MongoDB (Mongoose), Socket.IO |

**Default Admin Credentials:**
- Email: `admin@qissa.com`
- Password: `password123`

---

## 📱 Customer Website Features (Strictly Matching Section 5)

1. **5.1 Announcement Strip:** Top promotional banner managed dynamically by the admin.
2. **5.2 Main Navigation Header:** Restaurant branding, table indicator badge, search shortcut, and location trigger.
3. **5.3 Hero Section:** Visual header communicating authentic Middle Eastern cuisine with "Explore Menu" and "Today's Specials" CTAs.
4. **5.4 Table Banner:** Detects customer table from QR code scan (`Welcome to Qissa | Your Table: T02`) with verified hours and phone.
5. **5.5 Today's Specials:** Promoted dishes with promotional badges, prices, and direct detail modal access.
6. **5.6 Food Filters:** `ALL | VEG | NON-VEG` dynamic filtering.
7. **5.7 Instant Search:** Real-time dish, category, and ingredient keyword lookup.
8. **5.8 Popular Dishes:** Carousel of guest favourites backed by real interaction counts.
9. **5.9 Category Navigation:** Horizontal scrollable chips across all 14 restaurant menu sections.
10. **5.10 Individual Food Cards:** Every single menu item has its own dedicated card with prominent photograph, price, veg/non-veg indicator, and badges.
11. **5.11 Food Detail View:** Bottom sheet/modal with multiple image gallery, description, ingredients, portion choices, and allergen warnings.
12. **5.12 Restaurant Gallery & Footer:** Photo gallery, verified opening hours, contact, and social links.
13. **6. Food Assistant Chatbot:** Floating orange button with image-first recommendation cards (large photo, title, price, veg indicator) without cluttering walls of text.

---

## 🛠 Admin Portal Features (Strictly Matching Section 7)

- **Dashboard:** Real-time KPI counters (Total items, Active, Unavailable, Categories, Active Tables, Today's Specials).
- **Menu Management:** Add, edit, delete dishes, toggle instant availability, set custom pricing options, assign tags, and manage photographs.
- **Category Management:** Create, reorder, and safely delete categories.
- **Table & QR Management:** Add dining tables (e.g. T01, T02), generate unique unpredictable tokens, live preview QR codes, download PNGs, and print table tent cards.
- **Today's Specials Scheduler:** Feature dishes with custom badges and promotional pricing.
- **Restaurant Settings:** Manage branding, announcement banner text/toggle, and chatbot settings.

---

## 💻 Quick Start

### 1. Start Backend API
```bash
cd backend
npm run dev
```

### 2. Start Customer Website
```bash
cd customer
npm run dev
```

### 3. Start Admin Dashboard
```bash
cd admin
npm run dev
```

---

## 📋 Pending Client Information (For Production Launch)

- [ ] Official registered restaurant street address.
- [ ] Official primary phone number and WhatsApp reservation number.
- [ ] Final confirmation on unlisted menu prices marked `[CONFIRM]`.
- [ ] High-resolution logo file in vector / transparent PNG format.
- [ ] MongoDB Atlas production cluster connection string.
- [ ] Cloudinary production API credentials.
