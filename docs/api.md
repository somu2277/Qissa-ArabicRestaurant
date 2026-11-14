# Qissa Arabic Restaurant – REST API Documentation

Base URL: `http://localhost:5000/api`

---

## 1. Public Endpoints (Customer Facing)

### 1.1 Restaurant Profile
- **`GET /api/public/restaurant`**
- Returns restaurant name, arabicName, tagline, subtitle, coverImage, phone, openingHours, currency, announcement banner, and chatbot configuration.

### 1.2 Table QR Resolution
- **`GET /api/public/tables/:qrToken`**
- Validates the unpredictable QR token from table tent scans.
- Increments scan counter and updates `lastScannedAt`.
- Response:
  ```json
  {
    "success": true,
    "data": {
      "id": "6af6d232c05ad299b3a0c46c",
      "label": "T02",
      "location": "Main Dining Hall",
      "capacity": 4
    }
  }
  ```
- Returns `404 Not Found` if token is invalid or table deactivated.

### 1.3 Menu Categories
- **`GET /api/public/categories`**
- Returns all 14 active restaurant categories sorted by `sortOrder`.

### 1.4 Menu Items
- **`GET /api/public/menu`**
- Query Parameters:
  * `category` (Category ID)
  * `isVeg` (`true` / `false` / `all`)
  * `search` (Search term matching name, description, tags, keywords)
  * `badge` (`bestseller`, `new`, `chef_choice`, `popular`)
- Response: Array of individual dish cards with primaryImage, gallery images, prices, portion options, ingredients, and allergen notices.

### 1.5 Food Detail View
- **`GET /api/public/menu/:itemId`**
- Returns single food document. Increments `viewCount` asynchronously.

### 1.6 Today's Specials
- **`GET /api/public/specials`**
- Returns currently active specials, respecting date windows and recurring days.

### 1.7 Popular Dishes
- **`GET /api/public/popular`**
- Returns top dishes: admin-marked bestsellers first, followed by highest organic view interactions.

### 1.8 Food Assistant Chatbot
- **`POST /api/public/assistant/message`**
- Body: `{ "message": "I want spicy chicken under 500" }`
- Response:
  ```json
  {
    "success": true,
    "data": {
      "reply": "Here are our signature spicy delights:",
      "dishes": [
        {
          "_id": "...",
          "name": "Hummus Chicken Bowl",
          "price": 395,
          "primaryImage": "https://...",
          "isVeg": false,
          "badges": ["bestseller"]
        }
      ]
    }
  }
  ```

---

## 2. Admin Authentication Endpoints

### 2.1 Admin Login
- **`POST /api/admin/auth/login`**
- Body: `{ "email": "admin@qissa.com", "password": "password123" }`
- Returns JWT token and admin profile.

### 2.2 Verify Admin Session
- **`GET /api/admin/auth/me`**
- Headers: `Authorization: Bearer <token>`

---

## 3. Admin Management Endpoints (Protected by JWT)

- **`GET /api/admin/dashboard`** — Total items, active, unavailable, categories, specials, tables, and AI chatbot status.
- **`GET, POST, PUT, DELETE /api/admin/menu`** — Dish CRUD with multiple image URLs/galleries and availability toggle.
- **`GET, POST, PUT, DELETE /api/admin/categories`** — Category management with deletion safety checks.
- **`GET, POST, PUT, DELETE /api/admin/tables`** — Table and QR generation.
- **`POST /api/admin/tables/:id/regenerate-qr`** — Revoke old QR token and issue new QR code immediately.
- **`GET, POST, PUT, DELETE /api/admin/specials`** — Promotional scheduler.
- **`GET, PUT /api/admin/settings`** — Restaurant metadata, announcement banner toggle, and chatbot configuration.

---

## 4. Socket.IO Real-time Events

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `menu:updated` | Server → Client | `{ action, item, itemId }` | Broadcasted when admin adds, edits or deletes a dish |
| `availability:updated` | Server → Client | `{ itemId, isAvailable }` | Broadcasted when dish availability changes |
| `category:updated` | Server → Client | `{ action, category }` | Broadcasted on category modification |
| `specials:updated` | Server → Client | `{ action, special }` | Broadcasted when specials schedule changes |
| `settings:updated` | Server → Client | `RestaurantDoc` | Broadcasted when announcement banner or hours update |
