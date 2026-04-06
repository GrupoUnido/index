/* ==========
  Datos demo (edita aquí tus productos reales)
========== */
const PRODUCTS = [
  {
    id: "p1",
    name: "Nucleo Postura",
    price: 25,
    categories: ["Nucleos","Aves"], // ✅ puedes agregar más: ["Nucleos","Aves","Postura"]
    desc: "Núcleo nutricional concentrado para aves de corral que aporta vitaminas, minerales y nutrientes esenciales para fortalecer su alimentación. Ayuda a mejorar el crecimiento, la salud y la producción de huevos, favoreciendo un mejor rendimiento en granjas y crianzas avícolas.",
    img: "imagenes/image.png",
    featured: true,
  },
  {
    id: "p2",
    name: "Cerda Gestante Hacienda Buena Vista",
    price: 12,
    categories: ["Nucleos","Cerdos","Gestación"], // ✅ ejemplo: ["Nucleos","Cerdos","Gestación"]
    desc: "Núcleo nutricional concentrado para cerdos, formulado con vitaminas, minerales y nutrientes esenciales que fortalecen su alimentación y favorecen un crecimiento saludable. Contribuye a una mejor conversión alimenticia, mayor desarrollo y buen estado general del animal.",
    img: "imagenes/image (1).png",
    featured: true,
  },
  {
    id: "p3",
    name: "Pollo Engorde Invierno",
    price: 40,
    categories: ["Nucleos","Aves","Engorde"], // ✅ ejemplo: ["Nucleos","Aves","Engorde"]
    desc: "Núcleo nutricional especializado para pollitos, diseñado para aportar vitaminas, minerales y nutrientes esenciales en las primeras etapas de crecimiento. Favorece un desarrollo fuerte y saludable, mejora la vitalidad y fortalece las defensas, ayudando a lograr aves más resistentes y productivas desde el inicio.",
    img: "imagenes/image (2).png",
    featured: true,
  },
  {
    id: "p4",
    name: "Pollo Crecimiento Plus",
    price: 9,
    categories: ["Nucleos", "Aves", "Crecimiento"], // ✅ ejemplo: ["Nucleos","Aves","Crecimiento"]
    desc: "Núcleo nutricional para pollos, formulado con vitaminas, minerales y nutrientes esenciales que favorecen un crecimiento uniforme, buena conversión alimenticia y aves más fuertes y saludables. Contribuye al desarrollo adecuado, mejor rendimiento productivo y mayor vitalidad.",
    img: "imagenes/image (3).png",
    featured: false,
  },
  {
    id: "p5",
    name: "Nucleo De Pollo Engorde",
    price: 18,
    categories: ["Nucleos","Aves","Engorde"], // ✅ ejemplo: ["Nucleos","Aves","Engorde"]
    desc: "Compuesto Plus es un suplemento nutricional concentrado diseñado para enriquecer la alimentación animal con vitaminas, minerales y nutrientes esenciales. Ayuda a mejorar el aprovechamiento del alimento, fortalece la condición física y contribuye a un mejor rendimiento productivo.",
    img: "imagenes/image (4).png",
    featured: false,
  },
  {
    id: "p6",
    name: "Premezcla Levante Gallina",
    price: 7,
    categories: ["Premezclas", "Aves", "Levante"], // ✅ ejemplo: ["Premezclas","Aves","Levante"]
    desc: "Es una premezcla nutricional para aves, formulada con vitaminas, minerales y aditivos esenciales que enriquecen la alimentación y mejoran el rendimiento productivo. Favorece un crecimiento saludable, fortalece el sistema inmunológico y optimiza la conversión alimenticia",
    img: "imagenes/image (5).png",
    featured: false,
  },
  {
    id: "p7",
    name: "Postura 1 Gallina",
    price: 7,
    categories: ["Premezclas", "Aves", "Postura"], // ✅ ejemplo: ["Premezclas","Aves","Postura"]
    desc: "Nutricional para gallinas ponedoras, formulado con vitaminas, minerales y nutrientes esenciales que fortalecen la alimentación y favorecen una producción de huevos más constante y de mejor calidad.",
    img: "imagenes/image (6).png",
    featured: false,
  }
];

/* ==========
  Utilidades
========== */
const $ = (sel, parent=document) => parent.querySelector(sel);
const $$ = (sel, parent=document) => [...parent.querySelectorAll(sel)];

const fmt = (n) => `$${Number(n).toFixed(2)}`;

const store = {
  get(key, fallback){
    try{ return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  },
  set(key, value){
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const toast = (msg) => {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(window.__toastT);
  window.__toastT = setTimeout(() => el.classList.remove("show"), 1900);
};

/* ==========
  Estado
========== */
let cart = store.get("papel_cart", {});        // {id: qty}
let wishlist = store.get("papel_wishlist", {});// {id: true}
let currentCategory = "all";

let filters = {
  q: "",
  maxPrice: 100,
  sort: "featured"
};

/* ==========
  Helper categorías (compatibilidad)
========== */
function getCategories(p){
  // Si ya tiene categories (nuevo sistema)
  if(Array.isArray(p.categories) && p.categories.length) return p.categories;

  // Si todavía tiene category (viejo sistema), lo convertimos sin romper nada
  if(typeof p.category === "string" && p.category.trim()){
    return [p.category.trim()];
  }

  return [];
}

function categoriesLabel(p){
  const cats = getCategories(p);
  return cats.length ? cats.join(" • ") : "";
}

/* ==========
  Render productos
========== */
const grid = $("#productsGrid");

function getFilteredProducts(){
  let list = [...PRODUCTS];

  // category (ahora es multi-categoría)
  if(currentCategory !== "all"){
    list = list.filter(p => getCategories(p).includes(currentCategory));
  }

  // search
  const q = filters.q.trim().toLowerCase();
  if(q){
    list = list.filter(p => (p.name + " " + p.desc).toLowerCase().includes(q));
  }

  // max price
  list = list.filter(p => p.price <= filters.maxPrice);

  // sort
  switch(filters.sort){
    case "price-asc": list.sort((a,b)=>a.price-b.price); break;
    case "price-desc": list.sort((a,b)=>b.price-a.price); break;
    case "name-asc": list.sort((a,b)=>a.name.localeCompare(b.name)); break;
    default:
      // featured first
      list.sort((a,b)=>Number(b.featured)-Number(a.featured));
  }

  return list;
}

function renderProducts(){
  const list = getFilteredProducts();

  if(!list.length){
    grid.innerHTML = `
      <div class="panel" style="grid-column:1/-1">
        <strong>No encontramos resultados</strong>
        <p class="muted">Prueba con otra búsqueda o aumenta el precio máximo.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map(p => `
    <article class="card">
      <button class="card-media" data-open="${p.id}" aria-label="Ver ${p.name}">
        <img src="${p.img}" alt="${p.name}" loading="lazy">
      </button>
      <div class="card-body">
        <div style="display:flex;justify-content:space-between;gap:.6rem;align-items:start">
          <div>
            <h3>${p.name}</h3>
            <p class="muted small">${categoriesLabel(p).toUpperCase()}</p>
          </div>
          <button class="icon-btn" data-fav="${p.id}" title="Favorito">
            ❤
          </button>
        </div>

        <p class="price">${fmt(p.price)}</p>

        <div class="row">
          <button class="btn primary" data-add="${p.id}">Agregar</button>
          <button class="btn outline" data-open="${p.id}">Detalles</button>
        </div>
      </div>
    </article>
  `).join("");
}

/* ==========
  Carrito / Favoritos
========== */
function cartCount(){
  return Object.values(cart).reduce((a,b)=>a+b,0);
}
function wishlistCount(){
  return Object.keys(wishlist).length;
}
function syncBadges(){
  $("#cartCount").textContent = cartCount();
  $("#wishlistCount").textContent = wishlistCount();
  store.set("papel_cart", cart);
  store.set("papel_wishlist", wishlist);
}

function addToCart(id, qty=1){
  cart[id] = (cart[id] || 0) + qty;
  syncBadges();
  renderCart();
  toast("Agregado al carrito ✅");
}

function removeFromCart(id){
  delete cart[id];
  syncBadges();
  renderCart();
  toast("Eliminado del carrito 🗑️");
}

function changeQty(id, delta){
  const next = (cart[id] || 0) + delta;
  if(next <= 0) return removeFromCart(id);
  cart[id] = next;
  syncBadges();
  renderCart();
}

function toggleFav(id){
  if(wishlist[id]) delete wishlist[id];
  else wishlist[id] = true;
  syncBadges();
  renderWishlist();
  toast(wishlist[id] ? "Agregado a favoritos ❤" : "Quitado de favoritos");
}

function getProduct(id){
  return PRODUCTS.find(p => p.id === id);
}

function cartTotal(){
  return Object.entries(cart).reduce((sum,[id,qty])=>{
    const p = getProduct(id);
    return sum + (p ? p.price*qty : 0);
  },0);
}

function renderCart(){
  const wrap = $("#cartItems");
  const entries = Object.entries(cart);

  if(!entries.length){
    wrap.innerHTML = `<p class="muted">Tu carrito está vacío.</p>`;
    $("#cartTotal").textContent = fmt(0);
    return;
  }

  wrap.innerHTML = entries.map(([id,qty])=>{
    const p = getProduct(id);
    if(!p) return "";
    return `
      <div class="cart-item">
        <img src="${p.img}" alt="${p.name}">
        <div>
          <strong>${p.name}</strong>
          <div class="muted small">${fmt(p.price)} • ${categoriesLabel(p)}</div>
          <div class="qty">
            <button data-dec="${id}" aria-label="Disminuir">−</button>
            <strong>${qty}</strong>
            <button data-inc="${id}" aria-label="Aumentar">+</button>
            <button class="icon-btn" data-del="${id}" aria-label="Eliminar">🗑️</button>
          </div>
        </div>
        <strong>${fmt(p.price*qty)}</strong>
      </div>
    `;
  }).join("");

  $("#cartTotal").textContent = fmt(cartTotal());
}

function renderWishlist(){
  const wrap = $("#wishlistItems");
  const ids = Object.keys(wishlist);

  if(!ids.length){
    wrap.innerHTML = `<p class="muted">No tienes favoritos todavía.</p>`;
    return;
  }

  wrap.innerHTML = ids.map(id=>{
    const p = getProduct(id);
    if(!p) return "";
    return `
      <div class="cart-item">
        <img src="${p.img}" alt="${p.name}">
        <div>
          <strong>${p.name}</strong>
          <div class="muted small">${fmt(p.price)} • ${categoriesLabel(p)}</div>
          <div class="row" style="margin-top:.5rem">
            <button class="btn primary" data-add="${p.id}">Agregar</button>
            <button class="btn outline" data-fav="${p.id}">Quitar</button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

/* ==========
  Drawer helpers
========== */
const cartDrawer = $("#cartDrawer");
const wishlistDrawer = $("#wishlistDrawer");

function openDrawer(which){
  (which === "cart" ? cartDrawer : wishlistDrawer).classList.add("open");
}
function closeDrawer(which){
  (which === "cart" ? cartDrawer : wishlistDrawer).classList.remove("open");
}

/* ==========
  Modal producto
========== */
const modal = $("#productModal");
let modalProductId = null;

function openModal(id){
  const p = getProduct(id);
  if(!p) return;

  modalProductId = id;
  $("#modalImg").src = p.img;
  $("#modalImg").alt = p.name;
  $("#modalTitle").textContent = p.name;
  $("#modalDesc").textContent = p.desc;
  $("#modalPrice").textContent = fmt(p.price);

  modal.classList.remove("hidden");
}
function closeModal(){
  modal.classList.add("hidden");
  modalProductId = null;
}

/* ==========
  Tema (dark/light)
========== */
function initTheme(){
  const saved = store.get("papel_theme", "light");
  document.documentElement.setAttribute("data-theme", saved);
}
function toggleTheme(){
  const cur = document.documentElement.getAttribute("data-theme") || "light";
  const next = cur === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  store.set("papel_theme", next);
  toast(next === "dark" ? "Modo oscuro 🌙" : "Modo claro ☀️");
}

/* ==========
  Auth demo
========== */
function setAuthStatus(msg){
  $("#authStatus").textContent = msg || "";
}

function initAuthTabs(){
  $$(".tab").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      $$(".tab").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");

      const t = btn.dataset.tab;
      $$("[data-panel]").forEach(p=>p.classList.add("hidden"));
      $(`[data-panel="${t}"]`).classList.remove("hidden");
    });
  });
}

function registerUser(data){
  const users = store.get("papel_users", []);
  if(users.some(u=>u.email === data.email)){
    toast("Ese email ya existe.");
    return;
  }
  users.push(data);
  store.set("papel_users", users);
  toast("Cuenta creada ✅");
}

function loginUser(email, password){
  const users = store.get("papel_users", []);
  const ok = users.find(u=>u.email === email && u.password === password);
  if(!ok){
    setAuthStatus("Datos incorrectos. Intenta de nuevo.");
    return false;
  }
  store.set("papel_session", { email, name: ok.name });
  setAuthStatus(`Bienvenido/a, ${ok.name} ✅`);
  toast("Sesión iniciada");
  return true;
}

/* ==========
  Checkout WhatsApp
========== */
function checkoutWhatsApp(){
  const entries = Object.entries(cart);
  if(!entries.length){
    toast("Tu carrito está vacío.");
    return;
  }

  const lines = entries.map(([id,qty])=>{
    const p = getProduct(id);
    return `• ${p.name} x${qty} = ${fmt(p.price*qty)}`;
  });

  const total = fmt(cartTotal());
  const msg =
`Hola 👋, quiero hacer este pedido:
${lines.join("\n")}
Total: ${total}

Nombre:
Dirección:
Forma de pago:`;

  const phone = "18090000000"; // 👈 CAMBIA a tu WhatsApp real
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

/* ==========
  Eventos
========== */
function bindEvents(){
  // year
  $("#year").textContent = new Date().getFullYear();

  // Menu mobile
  $("#menuToggle").addEventListener("click", ()=>{
    const nav = $("#nav");
    const isOpen = nav.style.display === "flex";
    nav.style.display = isOpen ? "none" : "flex";
    nav.style.flexDirection = "column";
    nav.style.position = "absolute";
    nav.style.top = "100%";
    nav.style.right = "4%";
    nav.style.padding = "1rem";
    nav.style.border = "1px solid var(--border)";
    nav.style.background = "var(--panel)";
    nav.style.borderRadius = "18px";

    $("#menuToggle").setAttribute("aria-expanded", String(!isOpen));
  });

  // theme
  $("#themeBtn").addEventListener("click", toggleTheme);

  // categories
  $$(".cat").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      currentCategory = btn.dataset.cat;
      renderProducts();
      toast(currentCategory === "all" ? "Mostrando todo ✨" : `Categoría: ${currentCategory}`);
    });
  });

  // filters
  $("#searchInput").addEventListener("input", (e)=>{
    filters.q = e.target.value;
    renderProducts();
  });
  $("#sortSelect").addEventListener("change", (e)=>{
    filters.sort = e.target.value;
    renderProducts();
  });
  $("#priceRange").addEventListener("input", (e)=>{
    filters.maxPrice = Number(e.target.value);
    $("#priceValue").textContent = `$${filters.maxPrice}`;
    renderProducts();
  });

  // open drawers
  $("#cartBtn").addEventListener("click", ()=> openDrawer("cart"));
  $("#wishlistBtn").addEventListener("click", ()=> openDrawer("wishlist"));
  $("#closeCart").addEventListener("click", ()=> closeDrawer("cart"));
  $("#closeWishlist").addEventListener("click", ()=> closeDrawer("wishlist"));

  // clear cart
  $("#clearCartBtn").addEventListener("click", ()=>{
    cart = {};
    syncBadges();
    renderCart();
    toast("Carrito vacío.");
  });

  // checkout
  $("#checkoutBtn").addEventListener("click", checkoutWhatsApp);

  // Delegación de eventos (cards/buttons)
  document.addEventListener("click", (e)=>{
    const add = e.target.closest("[data-add]");
    const fav = e.target.closest("[data-fav]");
    const open = e.target.closest("[data-open]");
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    const del = e.target.closest("[data-del]");

    if(add){ addToCart(add.dataset.add); }
    if(fav){ toggleFav(fav.dataset.fav); }
    if(open){ openModal(open.dataset.open); }
    if(inc){ changeQty(inc.dataset.inc, +1); }
    if(dec){ changeQty(dec.dataset.dec, -1); }
    if(del){ removeFromCart(del.dataset.del); }
  });

  // modal
  $("#closeModal").addEventListener("click", closeModal);
  modal.addEventListener("click", (e)=>{
    if(e.target === modal) closeModal();
  });

  $("#modalAdd").addEventListener("click", ()=>{
    if(modalProductId) addToCart(modalProductId);
  });
  $("#modalFav").addEventListener("click", ()=>{
    if(modalProductId) toggleFav(modalProductId);
  });

  // forms demo
  $("#contactForm").addEventListener("submit", (e)=>{
    e.preventDefault();
    toast("Mensaje enviado ✅ (demo)");
    e.target.reset();
  });

  $("#registerForm").addEventListener("submit", (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    registerUser({
      name: fd.get("name").trim(),
      email: fd.get("email").trim().toLowerCase(),
      password: fd.get("password")
    });
    e.target.reset();
  });

  $("#loginForm").addEventListener("submit", (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    loginUser(
      fd.get("email").trim().toLowerCase(),
      fd.get("password")
    );
  });

  // Escape closes modal/drawers
  document.addEventListener("keydown", (e)=>{
    if(e.key === "Escape"){
      closeModal();
      closeDrawer("cart");
      closeDrawer("wishlist");
    }
  });
}

/* ==========
  Init
========== */
initTheme();
initAuthTabs();
renderProducts();
renderCart();
renderWishlist();
syncBadges();
bindEvents();
