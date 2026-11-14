# Qissa Arabic Restaurant – Production Deployment Guide

This guide covers deploying the three independently managed components:
1. **Backend API** → Render / Railway
2. **Customer Website** → Vercel (`menu.restaurantdomain.com`)
3. **Admin Dashboard** → Vercel (`admin.restaurantdomain.com`)
4. **Database** → MongoDB Atlas

---

## 1. MongoDB Atlas Setup

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Database Access**, create a user (e.g. `qissa_admin`) with password.
3. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) or whitelist your Render server IPs.
4. Obtain your connection URI:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/qissa_restaurant?retryWrites=true&w=majority
   ```

---

## 2. Backend Deployment (Render)

1. Connect your Git repository to **Render**.
2. Select **Web Service**.
3. Configure settings:
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
4. Configure Environment Variables in Render Dashboard:
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (or leave default assigned by Render)
   - `MONGODB_URI`: `mongodb+srv://...` (your Atlas URI)
   - `JWT_SECRET`: A strong 64-character random key
   - `JWT_EXPIRES_IN`: `7d`
   - `CLIENT_CUSTOMER_URL`: `https://menu.qissarestaurant.com`
   - `CLIENT_ADMIN_URL`: `https://admin.qissarestaurant.com`
5. Click **Create Web Service**.
6. The backend will automatically connect to MongoDB Atlas and seed the initial menu data if empty!

---

## 3. Customer Website Deployment (Vercel)

1. In Vercel, click **Add New Project** and select your repository.
2. Configure project:
   - **Framework Preset:** Vite
   - **Root Directory:** `customer`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add Environment Variables:
   - `VITE_API_BASE_URL`: `https://api.qissarestaurant.com/api/public`
   - `VITE_SOCKET_URL`: `https://api.qissarestaurant.com`
4. Click **Deploy**.
5. Set up custom domain: `menu.qissarestaurant.com`.

---

## 4. Admin Portal Deployment (Vercel)

1. In Vercel, click **Add New Project** (Separate project!).
2. Configure project:
   - **Framework Preset:** Vite
   - **Root Directory:** `admin`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add Environment Variables:
   - `VITE_API_BASE_URL`: `https://api.qissarestaurant.com/api/admin`
4. Click **Deploy**.
5. Set up custom domain: `admin.qissarestaurant.com`.

---

## 5. Domain & SSL Checklist

- [ ] `api.restaurantdomain.com` → points to Render backend
- [ ] `menu.restaurantdomain.com` → points to Vercel customer deployment
- [ ] `admin.restaurantdomain.com` → points to Vercel admin deployment
- [ ] Table QR codes generated in admin point to `https://menu.restaurantdomain.com/menu/:qrToken`
- [ ] HTTPS enforced on all domains
