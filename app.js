// === CONFIGURACIÓN ===
// CONFIGURACIÓN DE AUTH0
// Nota: Reemplaza YOUR_DOMAIN y YOUR_CLIENT_ID con los de tu aplicación Auth0.
const AUTH0_DOMAIN = "dev-feizpahal7mruxjd.us.auth0.com"; // e.g., "dev-abc12345.us.auth0.com"
const AUTH0_CLIENT_ID = "60SsApPUpiRnCSe2XzSMb03YDrevtPqo"; // e.g., "abcdef123456789"

// PRODUCTOS BASE DE DATOS
const products = [
    {
        id: 1,
        name: "Neon Blue Running T-Shirt",
        category: "Camisetas",
        description: "Camiseta deportiva premium con tecnología transpirable y áreas de malla.",
        price: 24990,
        image: "assets/sport_tshirt.png"
    },
    {
        id: 4,
        name: "Velocity Red T-Shirt",
        category: "Camisetas",
        description: "Camiseta rojo neón de secado rápido y ultraligera.",
        price: 26990,
        image: "assets/sport_tshirt_red.png"
    },
    {
        id: 5,
        name: "White Compression Core",
        category: "Camisetas",
        description: "Camiseta de compresión blanca con paneles de ventilación laterales.",
        price: 22990,
        image: "assets/sport_tshirt_white.png"
    },
    {
        id: 2,
        name: "Shadow Flex Shorts",
        category: "Pantalones",
        description: "Pantalón corto gris oscuro con acentos verde neón, ideal para running.",
        price: 34990,
        image: "assets/sport_shorts.png"
    },
    {
        id: 6,
        name: "Tech Fleece Jogger",
        category: "Pantalones",
        description: "Pantalón jogger premium gris claro con ajuste cónico y cordones.",
        price: 42990,
        image: "assets/sport_pants_jogger.png"
    },
    {
        id: 7,
        name: "Navy Sprint Shorts",
        category: "Pantalones",
        description: "Pantalón corto azul marino, diseñado para velocidad y máximo confort.",
        price: 32990,
        image: "assets/sport_shorts_navy.svg"
    },
    {
        id: 3,
        name: "Bolso Pro Gym Waterproof",
        category: "Accesorios",
        description: "Bolso deportivo negro mate impermeable con detalles en naranja.",
        price: 45990,
        image: "assets/sport_bag.png"
    },
    {
        id: 8,
        name: "Hydra Steel Bottle",
        category: "Accesorios",
        description: "Botella de acero inoxidable azul metálico con tapa anti-derrame.",
        price: 15990,
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: 9,
        name: "Aero Running Cap",
        category: "Accesorios",
        description: "Gorra deportiva negra transpirable con detalles reflectantes.",
        price: 18990,
        image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=400&q=80"
    }
];

// ESTADO GLOBAL
let auth0Client = null;
let cart = [];

// === INICIALIZACIÓN ===
window.onload = async () => {
    initAuth0();
    loadCartFromSession();
    renderProducts(products);
    updateCartUI();
};

// === AUTH0 INTEGRATION ===
async function initAuth0() {
    try {
        if (AUTH0_DOMAIN !== 'YOUR_DOMAIN') {
            auth0Client = await auth0.createAuth0Client({
                domain: AUTH0_DOMAIN,
                clientId: AUTH0_CLIENT_ID,
                authorizationParams: {
                    redirect_uri: window.location.origin
                }
            });

            // Manejar callback de login
            if (location.search.includes("state=") &&
                (location.search.includes("code=") || location.search.includes("error="))) {
                await auth0Client.handleRedirectCallback();
                window.history.replaceState({}, document.title, "/");
            }

            // Chequear sesión
            const isAuthenticated = await auth0Client.isAuthenticated();

            if (isAuthenticated) {
                const user = await auth0Client.getUser();
                document.getElementById('btn-login').classList.add('hidden');
                document.getElementById('btn-logout').classList.remove('hidden');
                document.getElementById('welcome-msg').classList.remove('hidden');
                document.getElementById('welcome-msg').innerText = `Hola, ${user.given_name || user.name}`;
                document.getElementById('btn-cart').classList.remove('hidden');
            } else {
                // Si no hay auth, mostramos igual el carrito pero pedimos login
                document.getElementById('btn-cart').classList.remove('hidden');
            }
        } else {
            console.warn("Auth0 credentials are not set. Auth0 flow will not work.");
            // Mock de interfaz sin auth real
            document.getElementById('btn-cart').classList.remove('hidden');

            // Simular evento en Login Button
            document.getElementById('btn-login').addEventListener('click', () => {
                alert("Debes configurar las variables AUTH0_DOMAIN y AUTH0_CLIENT_ID en app.js para usar el Login de Auth0 mediante Google.");
            });
        }
    } catch (e) {
        console.error("Error inicializando Auth0:", e);
    }
}

// Botones de sesión
if (document.getElementById('btn-login')) {
    document.getElementById('btn-login').addEventListener('click', async () => {
        if (auth0Client) {
            await auth0Client.loginWithRedirect();
        }
    });
}

if (document.getElementById('btn-logout')) {
    document.getElementById('btn-logout').addEventListener('click', () => {
        // Al cerrar sesión se limpia Session Storage como indican los requerimientos
        sessionStorage.removeItem('sportyCart');
        if (auth0Client) {
            auth0Client.logout({
                logoutParams: {
                    returnTo: window.location.origin
                }
            });
        }
    });
}

// === RENDERIZADO DE PRODUCTOS ===
function renderProducts(items) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';

    items.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
            <div class="img-container">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-desc">${product.description}</p>
                <div class="product-footer">
                    <span class="product-price">${formatCurrency(product.price)}</span>
                    <button class="btn btn-primary" onclick="addToCart(${product.id})">Agregar al carrito</button>
                </div>
            </div>
        `;
        grid.appendChild(div);
    });
}

// Filtros
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        const cat = e.target.getAttribute('data-category');
        if (cat === 'all') {
            renderProducts(products);
        } else {
            const filtered = products.filter(p => p.category === cat);
            renderProducts(filtered);
        }
    });
});

// === CARRITO Y SESSION STORAGE ===
function loadCartFromSession() {
    const saved = sessionStorage.getItem('sportyCart');
    if (saved) {
        cart = JSON.parse(saved);
    }
}

function saveCartToSession() {
    sessionStorage.setItem('sportyCart', JSON.stringify(cart));
    updateCartUI();
}

// Exponer la función mediante destructuring global falso para onClick en HTML
window.addToCart = async function (productId) {
    let isAuthenticated = false;
    if (auth0Client) isAuthenticated = await auth0Client.isAuthenticated();

    // Si queremos obligar login antes de agregar, podemos chequear "isAuthenticated" aquí
    // pero permitimos agregar y pedir login antes del checkout si es necesario.

    const product = products.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    saveCartToSession();
    showToast(`${product.name} agregado al carrito`);
};

window.updateQty = function (productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            cart = cart.filter(i => i.id !== productId);
        }
        saveCartToSession();
    }
};

window.removeFromCart = function (productId) {
    cart = cart.filter(i => i.id !== productId);
    saveCartToSession();
};

function formatCurrency(amount) {
    return '$' + amount.toLocaleString('es-CL');
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById('cart-badge').innerText = totalItems;

    // Actualizar contenido del carrito
    const container = document.getElementById('cart-items-container');
    container.innerHTML = '';

    let subtotal = 0;

    if (cart.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted)">Tu carrito está vacío.</p>';
    } else {
        cart.forEach(item => {
            subtotal += item.price * item.qty;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div class="cart-item-img">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <span class="price">${formatCurrency(item.price)} x ${item.qty}</span>
                </div>
                <div class="cart-item-actions">
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">×</button>
                </div>
            `;
            container.appendChild(div);
        });
    }

    document.getElementById('cart-subtotal').innerText = formatCurrency(subtotal);
    document.getElementById('cart-total').innerText = formatCurrency(subtotal);
}

// === NAVEGACIÓN Y SECCIONES ===
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
    window.scrollTo(0, 0);
}

document.getElementById('nav-btn-home').addEventListener('click', () => showSection('home-section'));
document.getElementById('btn-back-home').addEventListener('click', () => showSection('home-section'));
document.getElementById('btn-cart').addEventListener('click', () => showSection('cart-section'));
document.getElementById('btn-back-cart').addEventListener('click', () => showSection('cart-section'));
document.getElementById('btn-continue-shopping').addEventListener('click', () => {
    cart = [];
    saveCartToSession();
    showSection('home-section');
});

document.getElementById('btn-go-checkout').addEventListener('click', async () => {
    if (cart.length === 0) {
        showToast("Tu carrito está vacío", "error");
        return;
    }

    // Opcional: Validar si está logueado con Auth0 antes del checkout
    if (auth0Client) {
        const isAuth = await auth0Client.isAuthenticated();
        if (!isAuth && AUTH0_DOMAIN !== 'YOUR_DOMAIN') {
            showToast("Debes iniciar sesión para comprar", "error");
            document.getElementById('btn-login').click();
            return;
        }
    }

    // Actualizar vista previa del checkout
    const previewContainer = document.getElementById('checkout-items-preview');
    previewContainer.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.qty;
        previewContainer.innerHTML += `
            <div class="preview-item">
                <span>${item.qty}x ${item.name}</span>
                <span>${formatCurrency(item.price * item.qty)}</span>
            </div>
        `;
    });
    document.getElementById('checkout-total').innerText = formatCurrency(total);

    showSection('checkout-section');
});

// === VALIDACIÓN DEL FORMULARIO ===
document.getElementById('checkout-form').addEventListener('submit', (e) => {
    e.preventDefault();

    // Validar correo
    const emailInput = document.getElementById('email');
    const emailValue = emailInput.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
        emailInput.classList.add('invalid');
        return;
    } else {
        emailInput.classList.remove('invalid');
    }

    // Validar teléfono (sólo números, mínimo 8)
    const phoneInput = document.getElementById('phone');
    const phoneValue = phoneInput.value;
    const phoneRegex = /^[0-9]{8,15}$/;
    if (!phoneRegex.test(phoneValue)) {
        phoneInput.classList.add('invalid');
        return;
    } else {
        phoneInput.classList.remove('invalid');
    }

    // Preparar tarjeta de éxito
    const detailsContainer = document.getElementById('final-order-details');
    let total = 0;
    let listHTML = '<ul>';
    cart.forEach(item => {
        total += item.price * item.qty;
        listHTML += `<li><span>${item.qty}x ${item.name}</span> <span>${formatCurrency(item.price * item.qty)}</span></li>`;
    });
    listHTML += `</ul>`;

    detailsContainer.innerHTML = `
        <p><strong>Enviado a:</strong> ${document.getElementById('name').value}</p>
        <p><strong>Dirección:</strong> ${document.getElementById('address').value}</p>
        <hr style="margin: 10px 0; border: 0; border-top: 1px solid var(--border-color);">
        ${listHTML}
        <h3 style="display:flex; justify-content:space-between; margin-top:10px;">
            <span>Total Pagado:</span> <span>${formatCurrency(total)}</span>
        </h3>
    `;

    showSection('success-section');
    sessionStorage.removeItem('sportyCart');
});

// Resetea validaciones cuando el usuario escribe
document.getElementById('email').addEventListener('input', function () { this.classList.remove('invalid'); });
document.getElementById('phone').addEventListener('input', function () { this.classList.remove('invalid'); });

// === UTILIDADES ===
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.borderLeftColor = type === 'error' ? 'var(--error-color)' : 'var(--accent-color)';
    toast.innerText = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
