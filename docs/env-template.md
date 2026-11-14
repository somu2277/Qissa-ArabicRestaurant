# Environment Variables Template

### Backend (`backend/.env`)

```ini
# Environment & Server Port
PORT=5000
NODE_ENV=development

# MongoDB Atlas Database Connection String
# Leave empty for automatic in-memory development database
MONGODB_URI=mongodb+srv://<db_user>:<db_password>@cluster0.mongodb.net/qissa_menu?retryWrites=true&w=majority

# JWT Authentication for Admin Access
JWT_SECRET=qissa_production_secure_jwt_token_key_replace_with_random_string_2026
JWT_EXPIRES_IN=7d

# Allowed Origins (CORS & Socket.IO)
CLIENT_CUSTOMER_URL=http://localhost:5173
CLIENT_ADMIN_URL=http://localhost:5174

# Cloudinary Storage Configuration (Optional)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

### Customer Website (`customer/.env`)

```ini
VITE_API_BASE_URL=http://localhost:5000/api/public
VITE_SOCKET_URL=http://localhost:5000
```

---

### Admin Portal (`admin/.env`)

```ini
VITE_API_BASE_URL=http://localhost:5000/api/admin
```
