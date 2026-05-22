# Store Admin Portal

Vanilla HTML/CSS/JS admin portal for managing products, categories, and sales.
No frameworks, no build step — open in a browser and it works.

---

## Tech

- **HTML** — one file per page, all in `pages/`
- **CSS** — single shared stylesheet in `css/style.css`
- **JS** — UI helpers in `js/ui.js`, backend service layer in `js/services/`
- **Icons** — Tabler Icons (webfont via CDN)
- **Fonts** — DM Sans + DM Mono (Google Fonts via CDN)
- **Auth** — Keycloak JWT, stored in `localStorage`

---

## Project Structure

```
admin-portal/
│
├── index.html                        ← Landing page, redirects to pages/login.html
│
├── pages/                            ← One HTML file per page
│   ├── login.html                    ← Login form, authenticates via Keycloak
│   ├── products.html                 ← Product list, filterable by category
│   ├── add-product.html              ← Add new product (images + PDF upload)
│   ├── edit-product.html             ← Edit or delete an existing product
│   ├── categories.html               ← Category grid overview
│   ├── add-category.html             ← Add new category with image upload
│   ├── edit-category.html            ← Edit or delete an existing category
│   ├── sold-products.html            ← Table of all sold products, sorted by date
│   ├── view-sold-product.html        ← Detail view of a single sold product
│   └── coupons.html                  ← Placeholder — backend not yet implemented
│
├── css/
│   └── style.css                     ← Shared stylesheet for all pages
│                                       Defines CSS variables (colours, spacing, radius),
│                                       layout (sidebar + main shell), components
│                                       (cards, tables, forms, badges, dropzone,
│                                       spinners, toasts)
│
├── js/
│   │
│   ├── ui.js                         ← Shared UI utilities used by every page:
│   │                                   - showToast(message, type)     → success/error/warning notifications
│   │                                   - showSpinner() / hideSpinner() → full-page loading overlay
│   │                                   - setActiveNav(pageKey)         → highlights current sidebar item
│   │                                   - initDropzone(...)             → drag-and-drop file upload zones
│   │                                   - confirmDelete(message, fn)    → delete confirmation dialog
│   │
│   └── services/                     ← Backend communication layer (no DOM interaction here)
│       │
│       ├── config.js                 ← Central config object (window.Config):
│       │                               - apiUrl: base URL for the FastAPI backend
│       │                               - authenticateEndpoint: login endpoint path
│       │
│       ├── serverBase.js             ← Base class for all API communication:
│       │                               - Token stored/retrieved from localStorage
│       │                               - amAuthenticated() → checks token validity with backend
│       │                               - getRequest(endpoint, params)
│       │                               - postRequest(endpoint, data)
│       │                               - postFormRequest(endpoint, formData)  → for file uploads
│       │                               - deleteRequest(endpoint, params)
│       │                               - retrieveAccessToken(...)  → Keycloak token exchange
│       │                               - Redirects to login if unauthenticated
│       │
│       ├── product.js                ← Product and category API methods:
│       │                               Products:
│       │                               - getAllProducts()
│       │                               - getProductsByCategory(category)
│       │                               - getProductByProdCode(prodCode)
│       │                               - getProdCodesByCategory(category)
│       │                               - addProduct(data, imageFiles, documentFile)
│       │                               - updateProduct(data, imageFiles, documentFile)
│       │                               - deleteProductByProdCode(prodCode)
│       │                               Categories:
│       │                               - getCategoryNames()
│       │                               - getCategoryByName(name)
│       │                               - addCategory(name, imageFile)
│       │                               - updateCategory(name, imageFile)
│       │                               - deleteCategory(name)
│       │                               Sales:
│       │                               - getSoldProducts()
│       │                               - getSoldProductById(id)
│       │
│       └── user.js                   ← User authentication:
│                                       - authUser(data)  → hashes password, calls backend,
│                                         then exchanges client secret for Keycloak JWT
│
└── assets/                           ← Static assets (if needed)
    └── (logo, favicon, etc.)
```

---

## Script Load Order

Each page loads scripts in this order — services first, then UI helpers, then any inline page script:

```html
<script src="../js/services/config.js"></script>
<script src="../js/services/serverBase.js"></script>
<script src="../js/services/product.js"></script>   <!-- omit on login page -->
<script src="../js/ui.js"></script>
<script>
  // page-specific logic here
</script>
```

---

## Auth Flow

1. User submits login form on `pages/login.html`
2. Password is SHA-256 hashed client-side (CryptoJS)
3. `user.js → authUser()` POSTs `{ name, passwordHash, password }` to `/client/authenticateUser`
4. Backend returns a Keycloak `clientSecret` on success
5. `serverBase.js → retrieveAccessToken()` exchanges credentials + clientSecret with Keycloak for a JWT
6. JWT is stored in `localStorage` as `token`
7. All subsequent `/admin/*` requests include `Authorization: Bearer <token>`
8. `amAuthenticated()` is called before every protected request — redirects to login if invalid

---

## Config

Edit `js/services/config.js` to point at the right backend:

```js
// Development
apiUrl: 'http://localhost:8000/api/v1'

// Production
apiUrl: 'https://as.backend.code-smith.co.za/api/v1'
```

---

## Running Locally

No build step needed. Just serve the folder with any static server:

```bash
# Python
python -m http.server 3000

# Node
npx serve .
```

Then open `http://localhost:3000`.

> **Note:** The app must be served over HTTP (not opened as a `file://` URL) due to ES module CORS restrictions on some browsers.
