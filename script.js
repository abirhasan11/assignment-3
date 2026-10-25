/* ==========================================================
   Nature's Platter - front-end logic
   Cart, wishlist, search/filter/sort, coupons, auth (demo),
   checkout, newsletter, and UI helpers. No build step needed.
   ========================================================== */
(() => {
  'use strict';

  /* ---------- helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const money = (n) => '$' + (Math.round(n * 100) / 100).toFixed(2);
  const esc = (str) =>
    String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (_) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (_) {
        /* storage may be unavailable (private mode) - app still works in memory */
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (_) {}
    },
  };

  /* ---------- data ---------- */
  const IMG = {
    onion: 'export image/Group 16.png',
    tomato: 'export image/Group 16 (1).png',
    potato: 'export image/Group 16 (2).png',
  };

  const PRODUCTS = [
    { id: 1, name: 'Onion 1 KG', cat: 'onion', price: 39.99, rating: 4.5 },
    { id: 2, name: 'Potato 1 KG', cat: 'potato', price: 39.99, rating: 4.5 },
    { id: 3, name: 'Tomato 500 g', cat: 'tomato', price: 39.99, rating: 4.5 },
    { id: 4, name: 'Red Onion 2 KG', cat: 'onion', price: 69.99, rating: 4.7 },
    { id: 5, name: 'Baby Potato 1 KG', cat: 'potato', price: 44.5, rating: 4.3 },
    { id: 6, name: 'Cherry Tomato 250 g', cat: 'tomato', price: 24.99, rating: 4.8 },
    { id: 7, name: 'Organic Onion 1 KG', cat: 'onion', price: 49.99, rating: 4.9 },
    { id: 8, name: 'Potato 2 KG', cat: 'potato', price: 74.99, rating: 4.4 },
    { id: 9, name: 'Tomato 1 KG', cat: 'tomato', price: 59.99, rating: 4.6 },
    { id: 10, name: 'Spring Onion 500 g', cat: 'onion', price: 19.99, rating: 4.1 },
    { id: 11, name: 'Sweet Potato 1 KG', cat: 'potato', price: 54.99, rating: 4.5 },
    { id: 12, name: 'Roma Tomato 1 KG', cat: 'tomato', price: 64.99, rating: 4.2 },
  ].map((p) => ({ ...p, img: IMG[p.cat] }));

  const COUPONS = {
    FRESH30: { pct: 30, label: '30% off' },
    DAWAT20: { pct: 20, label: '20% off' },
    INDIA40: { pct: 40, label: '40% off' },
    WELCOME10: { pct: 10, label: '10% off' },
  };

  const FREE_DELIVERY_OVER = 100;
  const DELIVERY_FEE = 5;
  const PAGE_SIZE = 6;

  /* ---------- state ---------- */
  const state = {
    cart: store.get('np_cart', {}), // { [productId]: qty }
    wishlist: store.get('np_wishlist', []),
    coupon: store.get('np_coupon', null),
    user: store.get('np_session', null),
    filters: { cat: 'all', q: '', sort: 'default' },
    visible: PAGE_SIZE,
    authMode: 'login',
    pendingCheckout: false,
  };

  // drop anything that no longer exists in the catalogue
  state.cart = Object.fromEntries(
    Object.entries(state.cart).filter(([id, q]) => PRODUCTS.some((p) => p.id === +id) && q > 0)
  );
  state.wishlist = state.wishlist.filter((id) => PRODUCTS.some((p) => p.id === id));
  if (state.coupon && !COUPONS[state.coupon]) state.coupon = null;

  const byId = (id) => PRODUCTS.find((p) => p.id === +id);

  /* ---------- toast ---------- */
  function toast(message, type = 'success') {
    const box = $('#toast-container');
    if (!box) return;
    const el = document.createElement('div');
    const color = { success: 'alert-success', error: 'alert-error', info: 'alert-info' }[type] || 'alert-success';
    el.className = `alert ${color} shadow-lg text-sm py-2 px-4 pointer-events-auto`;
    el.setAttribute('role', 'status');
    el.innerHTML = `<span>${esc(message)}</span>`;
    box.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity .3s';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 300);
    }, 2600);
  }

  /* ---------- stars ---------- */
  const STAR_PATH = 'M12 .587l3.668 10.764H24L16.5 17.65l3.668 10.764L12 21.202l-8.168 7.213L7.5 17.65 0 11.351h8.332L12 .587z';

  /* ==========================================================
     PRODUCTS: filter, sort, render
     ========================================================== */
  function getFiltered() {
    const { cat, q, sort } = state.filters;
    const term = q.trim().toLowerCase();
    let list = PRODUCTS.filter(
      (p) => (cat === 'all' || p.cat === cat) && (!term || p.name.toLowerCase().includes(term) || p.cat.includes(term))
    );
    const sorters = {
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating,
      name: (a, b) => a.name.localeCompare(b.name),
    };
    if (sorters[sort]) list = list.slice().sort(sorters[sort]);
    return list;
  }

  function cardHTML(p) {
    const inWish = state.wishlist.includes(p.id);
    const qty = state.cart[p.id] || 0;
    return `
      <article class="relative bg-white rounded-lg shadow-md border border-gray-200 p-4 flex gap-3 items-center hover:shadow-lg transition" data-id="${p.id}">
        <button type="button" data-action="wish" data-id="${p.id}" aria-pressed="${inWish}"
          aria-label="${inWish ? 'Remove from' : 'Add to'} wishlist"
          class="absolute top-2 right-2 text-lg ${inWish ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}">
          <i class="${inWish ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        </button>
        <div class="w-2/5 shrink-0">
          <img class="w-full" loading="lazy" src="${esc(p.img)}" alt="${esc(p.name)}" />
        </div>
        <div class="flex flex-col gap-1 flex-1 min-w-0">
          <div class="text-yellow-500 flex items-center gap-2 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="${STAR_PATH}"/></svg>
            <span class="text-black text-sm">${p.rating.toFixed(1)}</span>
          </div>
          <h4 class="text-base font-semibold text-black">${esc(p.name)}</h4>
          <p class="text-gray-700 font-semibold">${money(p.price)}</p>
          <button type="button" data-action="add" data-id="${p.id}"
            class="mt-2 btn btn-sm bg-[#179800] text-white hover:bg-green-700 border-none">
            <i class="fa-solid fa-cart-plus"></i> ${qty ? `Add more (${qty})` : 'Add to cart'}
          </button>
        </div>
      </article>`;
  }

  function renderProducts() {
    const grid = $('#product-grid');
    if (!grid) return;
    const list = getFiltered();
    const shown = list.slice(0, state.visible);
    grid.innerHTML = shown.map(cardHTML).join('');
    $('#empty-state').classList.toggle('hidden', list.length > 0);
    $('#load-more').classList.toggle('hidden', list.length <= state.visible);
    $('#result-count').textContent = list.length
      ? `Showing ${shown.length} of ${list.length} product${list.length > 1 ? 's' : ''}`
      : '';
    $$('#category-chips .chip').forEach((chip) => {
      const active = chip.dataset.cat === state.filters.cat;
      chip.classList.toggle('btn-success', active);
      chip.classList.toggle('text-white', active);
      chip.classList.toggle('btn-outline', !active);
      chip.setAttribute('aria-pressed', String(active));
    });
  }

  function setFilter(patch) {
    Object.assign(state.filters, patch);
    state.visible = PAGE_SIZE;
    renderProducts();
  }

  /* ==========================================================
     CART
     ========================================================== */
  const cartCount = () => Object.values(state.cart).reduce((a, b) => a + b, 0);

  function totals() {
    const subtotal = Object.entries(state.cart).reduce((sum, [id, q]) => sum + byId(id).price * q, 0);
    const pct = state.coupon ? COUPONS[state.coupon].pct : 0;
    const discount = subtotal * (pct / 100);
    const after = subtotal - discount;
    const delivery = subtotal === 0 ? 0 : after >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;
    return { subtotal, discount, delivery, total: after + delivery };
  }

  function persistCart() {
    store.set('np_cart', state.cart);
    store.set('np_coupon', state.coupon);
  }

  function addToCart(id, qty = 1) {
    const p = byId(id);
    if (!p) return;
    state.cart[p.id] = Math.min(99, (state.cart[p.id] || 0) + qty);
    persistCart();
    renderCart();
    renderProducts();
    bumpBadge();
    toast(`${p.name} added to cart`);
  }

  function setQty(id, qty) {
    if (qty <= 0) delete state.cart[id];
    else state.cart[id] = Math.min(99, qty);
    persistCart();
    renderCart();
    renderProducts();
  }

  function bumpBadge() {
    const b = $('#cart-badge');
    b.classList.remove('bump');
    void b.offsetWidth; // restart animation
    b.classList.add('bump');
  }

  function renderCart() {
    const count = cartCount();
    const badge = $('#cart-badge');
    badge.textContent = count;
    badge.classList.toggle('hidden', count === 0);
    badge.classList.toggle('flex', count > 0);
    $('#cart-count-label').textContent = count ? `(${count} item${count > 1 ? 's' : ''})` : '';

    const wrap = $('#cart-items');
    const ids = Object.keys(state.cart);
    if (!ids.length) {
      wrap.innerHTML = `
        <div class="text-center text-gray-500 py-16">
          <i class="fa-solid fa-basket-shopping text-5xl mb-4"></i>
          <p>Your cart is empty.</p>
          <button type="button" data-action="shop" class="btn btn-sm btn-outline mt-4">Start shopping</button>
        </div>`;
    } else {
      wrap.innerHTML = ids
        .map((id) => {
          const p = byId(id);
          const q = state.cart[id];
          return `
          <div class="flex gap-3 items-center" data-id="${p.id}">
            <img src="${esc(p.img)}" alt="" class="w-16 h-16 rounded-md bg-[#F2EFE9] shrink-0" />
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-sm truncate">${esc(p.name)}</p>
              <p class="text-xs text-gray-500">${money(p.price)} each</p>
              <div class="flex items-center gap-2 mt-1">
                <button type="button" data-action="dec" data-id="${p.id}" class="w-7 h-7 rounded border hover:bg-gray-100" aria-label="Decrease quantity">−</button>
                <span class="w-6 text-center text-sm" aria-live="polite">${q}</span>
                <button type="button" data-action="inc" data-id="${p.id}" class="w-7 h-7 rounded border hover:bg-gray-100" aria-label="Increase quantity">+</button>
              </div>
            </div>
            <div class="text-right">
              <p class="font-semibold text-sm">${money(p.price * q)}</p>
              <button type="button" data-action="remove" data-id="${p.id}" class="text-xs text-red-500 hover:underline mt-1">Remove</button>
            </div>
          </div>`;
        })
        .join('');
    }

    const t = totals();
    $('#sum-subtotal').textContent = money(t.subtotal);
    $('#sum-discount').textContent = '-' + money(t.discount);
    $('#sum-coupon').textContent = state.coupon ? `(${state.coupon})` : '';
    $('#sum-delivery').textContent = t.delivery ? money(t.delivery) : 'Free';
    $('#sum-total').textContent = money(t.total);
    $('#co-total').textContent = money(t.total);
    $('#checkout-btn').disabled = count === 0;
    $('#clear-cart').classList.toggle('hidden', count === 0);
    $('#coupon-input').value = state.coupon || '';
  }

  function applyCoupon(raw, { silent = false } = {}) {
    const code = String(raw || '').trim().toUpperCase();
    const msg = $('#coupon-msg');
    if (!code) {
      state.coupon = null;
      persistCart();
      renderCart();
      msg.textContent = '';
      return false;
    }
    if (!COUPONS[code]) {
      msg.textContent = 'Invalid coupon code.';
      msg.className = 'text-xs min-h-4 text-red-600';
      if (!silent) toast('Invalid coupon code', 'error');
      return false;
    }
    state.coupon = code;
    persistCart();
    renderCart();
    msg.textContent = `Coupon ${code} applied: ${COUPONS[code].label}.`;
    msg.className = 'text-xs min-h-4 text-green-700';
    if (!silent) toast(`Coupon ${code} applied (${COUPONS[code].label})`);
    return true;
  }

  /* drawer open/close */
  let lastFocus = null;
  function openCart() {
    lastFocus = document.activeElement;
    $('#cart-overlay').classList.remove('hidden');
    const d = $('#cart-drawer');
    d.classList.remove('translate-x-full');
    d.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('#cart-close').focus();
  }
  function closeCart() {
    $('#cart-overlay').classList.add('hidden');
    const d = $('#cart-drawer');
    d.classList.add('translate-x-full');
    d.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  const cartOpen = () => $('#cart-drawer').getAttribute('aria-hidden') === 'false';

  /* ==========================================================
     WISHLIST
     ========================================================== */
  function renderWishlistBadge() {
    const b = $('#wishlist-badge');
    b.textContent = state.wishlist.length;
    b.classList.toggle('hidden', !state.wishlist.length);
    b.classList.toggle('flex', !!state.wishlist.length);
  }

  function toggleWish(id) {
    id = +id;
    const i = state.wishlist.indexOf(id);
    if (i >= 0) {
      state.wishlist.splice(i, 1);
      toast(`${byId(id).name} removed from wishlist`, 'info');
    } else {
      state.wishlist.push(id);
      toast(`${byId(id).name} saved to wishlist`);
    }
    store.set('np_wishlist', state.wishlist);
    renderWishlistBadge();
    renderProducts();
    if ($('#wishlist-modal').open) renderWishlistModal();
  }

  function renderWishlistModal() {
    const wrap = $('#wishlist-items');
    if (!state.wishlist.length) {
      wrap.innerHTML = '<p class="text-gray-500 text-center py-6">No saved items yet. Tap the heart on a product.</p>';
      return;
    }
    wrap.innerHTML = state.wishlist
      .map((id) => {
        const p = byId(id);
        return `
        <div class="flex items-center gap-3">
          <img src="${esc(p.img)}" alt="" class="w-14 h-14 rounded bg-[#F2EFE9]" />
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-sm truncate">${esc(p.name)}</p>
            <p class="text-xs text-gray-500">${money(p.price)}</p>
          </div>
          <button type="button" data-wl="add" data-id="${p.id}" class="btn btn-xs bg-green-600 text-white">Add</button>
          <button type="button" data-wl="remove" data-id="${p.id}" class="btn btn-xs btn-ghost text-red-500" aria-label="Remove">✕</button>
        </div>`;
      })
      .join('');
  }

  /* ==========================================================
     AUTH (demo - stored in the browser only)
     ========================================================== */
  async function hash(text) {
    try {
      if (window.crypto && crypto.subtle) {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
        return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (_) {}
    // fallback for non-secure contexts (e.g. some file:// setups)
    let h = 5381;
    for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
    return 'x' + (h >>> 0).toString(16);
  }

  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  function setFieldError(form, field, message) {
    const wrap = $(`[data-field="${field}"]`, form);
    if (!wrap) return;
    const p = $('.err', wrap);
    const input = $('input, textarea', wrap);
    if (p) p.textContent = message || '';
    if (input) {
      input.classList.toggle('input-error', !!message);
      input.classList.toggle('textarea-error', !!message);
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
    }
  }

  function setAuthMode(mode) {
    state.authMode = mode;
    const reg = mode === 'register';
    $('[data-field="name"]').classList.toggle('hidden', !reg);
    $('[data-field="confirm"]').classList.toggle('hidden', !reg);
    $('#auth-submit').textContent = reg ? 'Create account' : 'Login';
    $('#auth-password').autocomplete = reg ? 'new-password' : 'current-password';
    $$('[data-auth-tab]').forEach((t) => {
      const active = t.dataset.authTab === mode;
      t.classList.toggle('tab-active', active);
      t.setAttribute('aria-selected', String(active));
    });
    $('#auth-error').textContent = '';
    ['name', 'email', 'password', 'confirm'].forEach((f) => setFieldError($('#auth-form'), f, ''));
  }

  function openAuth(mode = 'login') {
    setAuthMode(mode);
    closeMobileMenu();
    const m = $('#auth-modal');
    if (!m.open) m.showModal();
    setTimeout(() => $(mode === 'register' ? '#auth-name' : '#auth-email').focus(), 50);
  }

  function renderAuth() {
    const loggedIn = !!state.user;
    const guest = $('#auth-guest');
    const user = $('#auth-user');
    guest.classList.toggle('hidden', loggedIn);
    guest.classList.toggle('md:flex', !loggedIn);
    user.classList.toggle('hidden', !loggedIn);
    user.classList.toggle('flex', loggedIn);
    $('#mobile-auth').classList.toggle('hidden', loggedIn);
    if (loggedIn) $('#user-name').textContent = state.user.name.split(' ')[0];
  }

  async function submitAuth(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const reg = state.authMode === 'register';
    const name = $('#auth-name').value.trim();
    const email = $('#auth-email').value.trim().toLowerCase();
    const pass = $('#auth-password').value;
    const confirm = $('#auth-confirm').value;
    let ok = true;

    setFieldError(form, 'name', '');
    setFieldError(form, 'email', '');
    setFieldError(form, 'password', '');
    setFieldError(form, 'confirm', '');
    $('#auth-error').textContent = '';

    if (reg && name.length < 2) { setFieldError(form, 'name', 'Please enter your full name.'); ok = false; }
    if (!emailOk(email)) { setFieldError(form, 'email', 'Enter a valid email address.'); ok = false; }
    if (reg ? pass.length < 6 : !pass) {
      setFieldError(form, 'password', reg ? 'Use at least 6 characters.' : 'Enter your password.');
      ok = false;
    }
    if (reg && confirm !== pass) { setFieldError(form, 'confirm', 'Passwords do not match.'); ok = false; }
    if (!ok) return;

    const users = store.get('np_users', {});
    const h = await hash(pass);

    if (reg) {
      if (users[email]) {
        $('#auth-error').textContent = 'An account with this email already exists. Try logging in.';
        return;
      }
      users[email] = { name, hash: h };
      store.set('np_users', users);
      state.user = { name, email };
      toast(`Welcome, ${name.split(' ')[0]}! Account created.`);
    } else {
      const u = users[email];
      if (!u || u.hash !== h) {
        $('#auth-error').textContent = 'Incorrect email or password.';
        return;
      }
      state.user = { name: u.name, email };
      toast(`Welcome back, ${u.name.split(' ')[0]}!`);
    }
    store.set('np_session', state.user);
    form.reset();
    $('#auth-modal').close();
    renderAuth();
    if (state.pendingCheckout) {
      state.pendingCheckout = false;
      openCheckout();
    }
  }

  function logout() {
    state.user = null;
    store.remove('np_session');
    renderAuth();
    toast('You have been logged out.', 'info');
  }

  /* ==========================================================
     CHECKOUT
     ========================================================== */
  function openCheckout() {
    if (!cartCount()) return;
    if (!state.user) {
      state.pendingCheckout = true;
      closeCart();
      toast('Please login to place your order.', 'info');
      openAuth('login');
      return;
    }
    closeCart();
    const form = $('#checkout-form');
    $('#checkout-step-form').classList.remove('hidden');
    $('#checkout-step-done').classList.add('hidden');
    if (!$('#co-name').value) $('#co-name').value = state.user.name;
    ['name', 'phone', 'address'].forEach((f) => setFieldError(form, f, ''));
    renderCart();
    $('#checkout-modal').showModal();
  }

  function submitCheckout(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = $('#co-name').value.trim();
    const phone = $('#co-phone').value.trim();
    const address = $('#co-address').value.trim();
    let ok = true;
    setFieldError(form, 'name', name.length < 2 ? 'Please enter your name.' : '');
    setFieldError(form, 'phone', /^[+\d][\d\s-]{6,16}$/.test(phone) ? '' : 'Enter a valid phone number.');
    setFieldError(form, 'address', address.length < 6 ? 'Please enter your full address.' : '');
    ok = name.length >= 2 && /^[+\d][\d\s-]{6,16}$/.test(phone) && address.length >= 6;
    if (!ok) return;

    const t = totals();
    const order = {
      id: 'NP-' + Date.now().toString().slice(-7),
      date: new Date().toISOString(),
      user: state.user.email,
      name, phone, address,
      payment: $('#co-payment').value,
      coupon: state.coupon,
      items: Object.entries(state.cart).map(([id, qty]) => ({ id: +id, name: byId(id).name, price: byId(id).price, qty })),
      total: t.total,
    };
    const orders = store.get('np_orders', []);
    orders.push(order);
    store.set('np_orders', orders);

    state.cart = {};
    state.coupon = null;
    persistCart();
    renderCart();
    renderProducts();

    $('#order-id').textContent = '#' + order.id;
    $('#order-eta').textContent = `Total ${money(order.total)}. Estimated delivery: 30-45 minutes.`;
    $('#checkout-step-form').classList.add('hidden');
    $('#checkout-step-done').classList.remove('hidden');
    form.reset();
  }

  /* ==========================================================
     NEWSLETTER
     ========================================================== */
  function initNewsletter() {
    const form = $('#newsletter-form');
    const input = $('#newsletter-email');
    const msg = $('#newsletter-msg');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = input.value.trim().toLowerCase();
      if (!emailOk(email)) {
        msg.textContent = 'Please enter a valid email address.';
        msg.className = 'text-sm min-h-5 text-red-600';
        input.focus();
        return;
      }
      const list = store.get('np_newsletter', []);
      if (list.includes(email)) {
        msg.textContent = 'You are already subscribed.';
        msg.className = 'text-sm min-h-5 text-orange-600';
        return;
      }
      list.push(email);
      store.set('np_newsletter', list);
      msg.textContent = 'Thanks for subscribing! Check your inbox for offers.';
      msg.className = 'text-sm min-h-5 text-green-700';
      toast('Subscribed to Grocery News!');
      form.reset();
    });
    input.addEventListener('input', () => { msg.textContent = ''; });
  }

  /* ==========================================================
     NAV, SEARCH, UI EXTRAS
     ========================================================== */
  function closeMobileMenu() {
    const menu = $('#mobile-menu');
    menu.classList.add('hidden');
    $('#menu-toggle').setAttribute('aria-expanded', 'false');
  }

  function toggleSearch(force) {
    const panel = $('#search-panel');
    const open = typeof force === 'boolean' ? force : panel.classList.contains('hidden');
    panel.classList.toggle('hidden', !open);
    if (open) $('#global-search').focus();
  }

  function scrollToProducts() {
    const el = $('#products');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  function initReveal() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach((i) => i.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      }),
      { threshold: 0.12 }
    );
    items.forEach((i) => io.observe(i));
  }

  function initReviews() {
    // each testimonial needs its own radio group (they all shared "rating-1")
    $$('#reviews .rating').forEach((group, i) => {
      $$('input', group).forEach((r) => r.setAttribute('name', `rating-${i + 1}`));
    });
  }

  /* ==========================================================
     EVENT WIRING
     ========================================================== */
  function bind() {
    // product grid (event delegation)
    $('#product-grid').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      if (btn.dataset.action === 'add') addToCart(+btn.dataset.id);
      if (btn.dataset.action === 'wish') toggleWish(+btn.dataset.id);
    });

    // toolbar
    $('#category-chips').addEventListener('click', (e) => {
      const chip = e.target.closest('[data-cat]');
      if (chip) setFilter({ cat: chip.dataset.cat });
    });
    const productSearch = $('#product-search');
    const globalSearch = $('#global-search');
    let timer;
    const onSearch = (val, source) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (source !== productSearch) productSearch.value = val;
        if (source !== globalSearch) globalSearch.value = val;
        setFilter({ q: val });
      }, 150);
    };
    productSearch.addEventListener('input', (e) => onSearch(e.target.value, productSearch));
    globalSearch.addEventListener('input', (e) => onSearch(e.target.value, globalSearch));
    globalSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); scrollToProducts(); }
    });
    $('#product-sort').addEventListener('change', (e) => setFilter({ sort: e.target.value }));
    $('#load-more').addEventListener('click', () => { state.visible += PAGE_SIZE; renderProducts(); });
    $('#reset-filters').addEventListener('click', () => {
      productSearch.value = '';
      globalSearch.value = '';
      $('#product-sort').value = 'default';
      setFilter({ cat: 'all', q: '', sort: 'default' });
    });

    // nav
    $('#search-toggle').addEventListener('click', () => toggleSearch());
    $('#search-close').addEventListener('click', () => toggleSearch(false));
    $('#menu-toggle').addEventListener('click', () => {
      const menu = $('#mobile-menu');
      const open = menu.classList.toggle('hidden') === false;
      $('#menu-toggle').setAttribute('aria-expanded', String(open));
    });
    $$('.nav-link').forEach((a) => a.addEventListener('click', closeMobileMenu));
    $('#cart-toggle').addEventListener('click', openCart);
    $('#wishlist-toggle').addEventListener('click', () => { renderWishlistModal(); $('#wishlist-modal').showModal(); });
    $('#login-btn').addEventListener('click', () => openAuth('login'));
    $('#register-btn').addEventListener('click', () => openAuth('register'));
    $$('[data-open-auth]').forEach((b) => b.addEventListener('click', () => openAuth(b.dataset.openAuth)));
    $('#logout-btn').addEventListener('click', logout);

    // cart drawer
    $('#cart-close').addEventListener('click', closeCart);
    $('#cart-overlay').addEventListener('click', closeCart);
    $('#cart-items').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const id = +btn.dataset.id;
      const act = btn.dataset.action;
      if (act === 'inc') setQty(id, (state.cart[id] || 0) + 1);
      if (act === 'dec') setQty(id, (state.cart[id] || 0) - 1);
      if (act === 'remove') { setQty(id, 0); toast(`${byId(id).name} removed`, 'info'); }
      if (act === 'shop') { closeCart(); scrollToProducts(); }
    });
    $('#clear-cart').addEventListener('click', () => {
      state.cart = {};
      persistCart();
      renderCart();
      renderProducts();
      toast('Cart cleared', 'info');
    });
    $('#coupon-form').addEventListener('submit', (e) => {
      e.preventDefault();
      applyCoupon($('#coupon-input').value);
    });
    $('#checkout-btn').addEventListener('click', openCheckout);
    $('#checkout-form').addEventListener('submit', submitCheckout);

    // wishlist modal
    $('#wishlist-items').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-wl]');
      if (!btn) return;
      if (btn.dataset.wl === 'add') addToCart(+btn.dataset.id);
      if (btn.dataset.wl === 'remove') toggleWish(+btn.dataset.id);
    });

    // auth modal
    $$('[data-auth-tab]').forEach((t) => t.addEventListener('click', () => setAuthMode(t.dataset.authTab)));
    $('#auth-form').addEventListener('submit', submitAuth);
    $('#toggle-pass').addEventListener('click', () => {
      const i = $('#auth-password');
      const show = i.type === 'password';
      i.type = show ? 'text' : 'password';
      $('#toggle-pass i').className = show ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
      $('#toggle-pass').setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
    $('#auth-modal').addEventListener('close', () => { state.pendingCheckout = false; });

    // offer / coupon buttons + smooth-scroll buttons
    $$('[data-coupon]').forEach((b) =>
      b.addEventListener('click', () => {
        applyCoupon(b.dataset.coupon);
        if (b.dataset.scroll) document.querySelector(b.dataset.scroll)?.scrollIntoView({ behavior: 'smooth' });
      })
    );

    // global keyboard + scroll
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (cartOpen()) closeCart();
      toggleSearch(false);
      closeMobileMenu();
    });

    const nav = $('#site-nav');
    const topBtn = $('#back-to-top');
    const onScroll = () => {
      nav.classList.toggle('shadow-md', window.scrollY > 10);
      topBtn.classList.toggle('hidden', window.scrollY < 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // keep tabs in sync (cart changed in another tab)
    window.addEventListener('storage', (e) => {
      if (!e.key || !e.key.startsWith('np_')) return;
      state.cart = store.get('np_cart', {});
      state.wishlist = store.get('np_wishlist', []);
      state.coupon = store.get('np_coupon', null);
      state.user = store.get('np_session', null);
      renderAll();
    });
  }

  function renderAll() {
    renderProducts();
    renderCart();
    renderWishlistBadge();
    renderAuth();
  }

  /* ---------- init ---------- */
  function init() {
    bind();
    initNewsletter();
    initReveal();
    initReviews();
    setAuthMode('login');
    renderAll();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
