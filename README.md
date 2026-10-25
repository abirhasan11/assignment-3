<div align="center">

<img src="c2-assets/logo-header.png" alt="Nature's Platter logo" width="220" />

# 🥬 Nature's Platter

### A fresh, fully interactive grocery-store front-end

Responsive landing page with a working cart, coupons, wishlist, login, checkout and more, built with HTML, Tailwind CSS, DaisyUI and vanilla JavaScript.

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](#-tech-stack)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)](#-tech-stack)
[![DaisyUI](https://img.shields.io/badge/DaisyUI-5A0EF8?logo=daisyui&logoColor=white)](#-tech-stack)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](#-tech-stack)
[![Responsive](https://img.shields.io/badge/Design-Responsive-2ea44f)](#-features)

[Features](#-features) · [Demo](#-live-demo) · [Getting Started](#-getting-started) · [How to Use](#-how-to-use) · [Coupons](#-coupon-codes) · [Structure](#-project-structure)

</div>

---

## 📖 About

**Nature's Platter** is a modern online grocery store front-end (Assignment 3). It starts as a clean landing page (hero, services, popular products, brand offers, client reviews, newsletter) and adds a complete shopping experience on top using plain JavaScript: no framework, no build step, no backend.

> Freshness you can count on, prices you'll love!

## 🌐 Live Demo

🔗 **[your-username.github.io/assignment-3](https://your-username.github.io/assignment-3/)**

<!-- Add a screenshot after you take one:
![Preview](screenshots/preview.png)
-->

## 🚀 Features

### Shopping
- 🛒 **Cart drawer** with add, remove, quantity +/- and clear cart
- 💰 **Live totals**: subtotal, discount, delivery fee and grand total
- 🚚 **Free delivery** on orders over **$100** (otherwise $5)
- 🏷️ **Coupon codes** (also applied by the offer banner buttons)
- ❤️ **Wishlist** with a saved-items popup
- ✅ **Checkout** with form validation and an order confirmation

### Browsing
- 🔍 **Search** from the navbar or the product section (live results)
- 🥕 **Category filter**: All / Onion / Potato / Tomato
- ↕️ **Sorting**: featured, price (low/high), top rated, name A-Z
- ➕ **Load more** pagination and an empty-state with reset

### Account & Forms
- 🔐 **Login / Register** with validation and show/hide password (demo, browser-only)
- 📬 **Newsletter** signup with email validation and duplicate check

### Experience
- 📱 **Fully responsive** with a working mobile menu
- 💾 **Persistence** with `localStorage` (cart, wishlist, coupon, session, orders)
- 🔔 **Toast notifications**, scroll-reveal animations, sticky navbar, back-to-top button
- ♿ **Accessible**: ARIA labels, focus handling, `Esc` to close, reduced-motion support

## 🧩 Page Sections

| Section | Description |
| --- | --- |
| **Navbar** | Logo, links, search, wishlist, cart, Login / Register (or user name + Logout) |
| **Hero** | "Freshness You Can Count On, Prices You'll Love!" |
| **Services** | 24/7 Services, Fast Delivery, Healthy Products |
| **Popular Products** | 30% off promo and a filterable, sortable product grid |
| **Arrival & Offers** | Dawat and India Gate brand offers |
| **Clients Say** | Customer reviews with ratings |
| **Footer** | Newsletter, quick links, social media |

## 🛠️ Tech Stack

- **HTML5**
- **[Tailwind CSS](https://tailwindcss.com/)** (CDN)
- **[DaisyUI](https://daisyui.com/)** v4.12.23 (modals, buttons, toasts, tabs)
- **Vanilla JavaScript (ES6+)** in `script.js`
- **[Font Awesome](https://fontawesome.com/)** v6.4.2 (icons)
- **[Google Fonts](https://fonts.google.com/specimen/Sora)** (Sora)

## 📦 Getting Started

No installation or build step is required. An internet connection is needed because Tailwind, DaisyUI, icons and fonts load from CDNs.

```bash
# 1. Clone the repository
git clone https://github.com/your-username/assignment-3.git

# 2. Open the folder
cd assignment-3

# 3. Open index.html in your browser
```

Or serve it locally:

```bash
npx serve .
# or use the "Live Server" extension in VS Code
```

## 🧪 How to Use

1. **Browse** the *Popular Products* section. Use the chips, search box and sort menu.
2. **Add to cart** and open the cart from the navbar icon.
3. **Apply a coupon** in the cart (or click an offer banner button).
4. Click **Checkout**. If you are not logged in you will be asked to register or login first.
5. Fill in name, phone and address, then **Place order**.

> ℹ️ Accounts and orders are saved only in your browser's `localStorage`. This is a front-end demo, so no real payment or server is involved.

## 🏷️ Coupon Codes

| Code | Discount |
| --- | --- |
| `FRESH30` | 30% off |
| `DAWAT20` | 20% off |
| `INDIA40` | 40% off |
| `WELCOME10` | 10% off |

## 📁 Project Structure

```
assignment-3/
├── c2-assets/          # Logos, hero image, banners and service icons
├── export image/       # Product and user images
├── index.html          # Page markup (navbar, sections, modals, cart drawer)
├── script.js           # All interactivity (products, cart, auth, checkout...)
├── tailwind.config.js  # Tailwind configuration
└── README.md
```

### `script.js` at a glance

| Area | What it does |
| --- | --- |
| Products | Data, search, filter, sort, pagination, rendering |
| Cart | Add/remove/quantity, totals, coupons, drawer |
| Wishlist | Toggle, badge, popup |
| Auth | Register/login with validation (hashed password in `localStorage`) |
| Checkout | Validation, order creation, confirmation |
| UI | Toasts, mobile menu, search panel, scroll reveal, back-to-top |

## 🚢 Deploy to GitHub Pages

1. Push the project to a GitHub repository (files at the repo root).
2. Go to **Settings → Pages**.
3. Choose **Branch: `main`** and **Folder: `/ (root)`**, then **Save**.
4. Your site will be live in a minute or two.

## 🔮 Roadmap

- [x] Cart, wishlist, coupons and checkout
- [x] Search, filter, sort and pagination
- [x] Login / Register (front-end demo)
- [x] Mobile navigation
- [ ] Real backend and database
- [ ] Product details page
- [ ] Online payment integration
- [ ] Dark mode

## 🤝 Contributing

Suggestions and improvements are welcome.

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

## 👤 Author

**Your Name**

- GitHub: [@your-username](https://github.com/your-username)
- Email: your.email@example.com

---

<div align="center">

⭐ If you like this project, give it a star! ⭐

</div>
