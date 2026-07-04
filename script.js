// Default menu items (used on first load)
const DEFAULT_MENU_ITEMS = [
    { id: 1, name: "Idly", price: 10, image: "https://t3.ftcdn.net/jpg/03/62/02/26/360_F_362022640_fZ6UM0JycJlFDdBiR1pYlNddKfdGvYwR.jpg" },
    { id: 2, name: "Dosa", price: 40, image: "https://www.shutterstock.com/image-photo/side-view-isometric-angle-crispy-600nw-2600398075.jpg" },
    { id: 3, name: "Parotta", price: 20, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRseXnfEDCNrCtRcCpe5A0J37MaorCsuOPuA&s" },
    { id: 4, name: "Omelette", price: 10, image: "https://elizabethpeddey.com.au/wp-content/uploads/2020/04/OMELETTE-scaled.jpg" }
];

let menuItems = [];
let pendingImageData = null;

// Cart State
let cart = [];
let currentOrder = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadMenuFromStorage();
    loadCartFromStorage();
    renderMenu();
    setupEventListeners();
    updateCartUI();
});

// Setup Event Listeners
function setupEventListeners() {
    document.getElementById('cartToggle').addEventListener('click', toggleCart);
    document.getElementById('closeCartBtn').addEventListener('click', toggleCart);
    document.getElementById('cartOverlay').addEventListener('click', toggleCart);

    document.getElementById('checkoutBtn').addEventListener('click', openCheckoutModal);
    document.getElementById('closeModalBtn').addEventListener('click', closeCheckoutModal);
    document.getElementById('payCashBtn').addEventListener('click', () => completePayment('cash'));
    document.getElementById('payOnlineBtn').addEventListener('click', openQRPaymentModal);
    document.getElementById('closeQrModalBtn').addEventListener('click', closeQRPaymentModal);
    document.getElementById('confirmOnlinePaymentBtn').addEventListener('click', () => completePayment('online'));

    document.getElementById('dashboardBtn').addEventListener('click', showDashboard);
    document.getElementById('backToMenuBtn').addEventListener('click', showMenu);

    document.getElementById('settingsBtn').addEventListener('click', openSettingsModal);
    document.getElementById('closeSettingsBtn').addEventListener('click', closeSettingsModal);
    document.getElementById('cancelSettingsBtn').addEventListener('click', closeSettingsModal);
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);

    document.getElementById('manageMenuBtn')?.addEventListener('click', openMenuModal);
    document.getElementById('manageMenuBtnAlt')?.addEventListener('click', openMenuModal);
    document.getElementById('closeMenuBtn')?.addEventListener('click', closeMenuModal);
    document.getElementById('addItemForm')?.addEventListener('submit', handleAddItem);
    document.getElementById('newItemImageFile')?.addEventListener('change', handleImageFileSelect);
    document.getElementById('clearImagePreview')?.addEventListener('click', clearImagePreview);
    document.getElementById('newItemImageUrl')?.addEventListener('input', () => {
        if (document.getElementById('newItemImageUrl').value.trim()) {
            clearImagePreview();
        }
    });
}

// Render Menu
function renderMenu() {
    const menuGrid = document.getElementById('menuGrid');
    menuGrid.innerHTML = '';

    if (menuItems.length === 0) {
        menuGrid.innerHTML = `
            <div class="empty-menu">
                <p>No items on the menu.</p>
                <button class="btn-primary" onclick="openMenuModal()">Add Items</button>
            </div>
        `;
        return;
    }

    menuItems.forEach(item => {
        const menuItemCard = document.createElement('div');
        menuItemCard.className = 'menu-item';
        menuItemCard.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="menu-item-image" onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(item.name)}'">
            <div class="menu-item-content">
                <h3 class="menu-item-name">${item.name}</h3>
                <p class="menu-item-price">₹${item.price}</p>
                <button class="btn-add-cart" onclick="addToCart(${item.id})">Add to Cart</button>
            </div>
        `;
        menuGrid.appendChild(menuItemCard);
    });
}

// Menu Storage
function loadMenuFromStorage() {
    const saved = localStorage.getItem('restaurantMenu');
    if (saved) {
        menuItems = JSON.parse(saved);
    } else {
        menuItems = [...DEFAULT_MENU_ITEMS];
        saveMenuToStorage();
    }
}

function saveMenuToStorage() {
    localStorage.setItem('restaurantMenu', JSON.stringify(menuItems));
}

function getNextItemId() {
    if (menuItems.length === 0) return 1;
    return Math.max(...menuItems.map(i => i.id)) + 1;
}

// Manage Menu Modal
function openMenuModal() {
    renderManageMenuList();
    clearAddItemForm();
    document.getElementById('menuModal').classList.add('show');
}

function closeMenuModal() {
    document.getElementById('menuModal').classList.remove('show');
    clearAddItemForm();
}

function renderManageMenuList() {
    const list = document.getElementById('manageMenuList');

    if (menuItems.length === 0) {
        list.innerHTML = '<p class="empty-menu-text">No items yet. Add your first item below.</p>';
        return;
    }

    list.innerHTML = menuItems.map(item => `
        <div class="manage-menu-item">
            <img src="${item.image}" alt="${item.name}" class="manage-menu-thumb" onerror="this.src='https://via.placeholder.com/80?text=${encodeURIComponent(item.name)}'">
            <div class="manage-menu-details">
                <strong>${item.name}</strong>
                <span>₹${item.price}</span>
            </div>
            <button class="btn-delete-item" onclick="deleteMenuItem(${item.id})" title="Remove from menu">Delete</button>
        </div>
    `).join('');
}

function deleteMenuItem(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    if (!confirm(`Remove "${item.name}" from the menu?\n\nIt will no longer be available for orders.`)) {
        return;
    }

    menuItems = menuItems.filter(i => i.id !== itemId);
    cart = cart.filter(i => i.id !== itemId);

    saveMenuToStorage();
    saveCartToStorage();
    renderMenu();
    renderManageMenuList();
    updateCartUI();
    showNotification(`${item.name} removed from menu`);
}

function handleAddItem(e) {
    e.preventDefault();

    const name = document.getElementById('newItemName').value.trim();
    const price = parseFloat(document.getElementById('newItemPrice').value);
    const imageUrl = document.getElementById('newItemImageUrl').value.trim();

    if (!name) {
        alert('Please enter an item name.');
        return;
    }
    if (!price || price <= 0) {
        alert('Please enter a valid price.');
        return;
    }

    const image = pendingImageData || imageUrl;
    if (!image) {
        alert('Please provide an image URL or upload an image.');
        return;
    }

    const newItem = {
        id: getNextItemId(),
        name,
        price,
        image
    };

    menuItems.push(newItem);
    saveMenuToStorage();
    renderMenu();
    renderManageMenuList();
    clearAddItemForm();
    showNotification(`${name} added to menu!`);
}

function handleImageFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        e.target.value = '';
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        alert('Image is too large. Please use an image under 2MB.');
        e.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        pendingImageData = event.target.result;
        const preview = document.getElementById('imagePreview');
        preview.src = pendingImageData;
        document.getElementById('imagePreviewWrap').style.display = 'block';
        document.getElementById('newItemImageUrl').value = '';
    };
    reader.readAsDataURL(file);
}

function clearImagePreview() {
    pendingImageData = null;
    document.getElementById('newItemImageFile').value = '';
    document.getElementById('imagePreview').src = '';
    document.getElementById('imagePreviewWrap').style.display = 'none';
}

function clearAddItemForm() {
    document.getElementById('addItemForm').reset();
    clearImagePreview();
}

// Cart Functions
function addToCart(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    const existingItem = cart.find(i => i.id === itemId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1
        });
    }

    saveCartToStorage();
    updateCartUI();
    showNotification(`${item.name} added to cart!`);
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveCartToStorage();
    updateCartUI();
}

function updateQuantity(itemId, change) {
    const item = cart.find(i => i.id === itemId);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
        removeFromCart(itemId);
    } else {
        saveCartToStorage();
        updateCartUI();
    }
}

function calculateTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function clearCart() {
    cart = [];
    saveCartToStorage();
    updateCartUI();
}

// Cart UI Updates
function updateCartUI() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');

    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartTotal.textContent = `₹${calculateTotal()}`;
    checkoutBtn.disabled = cart.length === 0;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₹${item.price} × ${item.quantity} = ₹${item.price * item.quantity}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            </div>
        `).join('');
    }
}

// Cart Sidebar Toggle
function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');

    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
}

// Checkout Modal
function openCheckoutModal() {
    if (cart.length === 0) return;

    const modal = document.getElementById('checkoutModal');
    const orderSummary = document.getElementById('orderSummary');

    const orderItems = cart.map(item => `
        <div class="order-summary-item">
            <span>${item.name} × ${item.quantity}</span>
            <span>₹${item.price * item.quantity}</span>
        </div>
    `).join('');

    const total = calculateTotal();

    orderSummary.innerHTML = `
        ${orderItems}
        <div class="order-summary-total">
            <span>Total</span>
            <span>₹${total}</span>
        </div>
    `;

    modal.classList.add('show');
    currentOrder = {
        items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity
        })),
        subtotal: total,
        total: total,
        paymentMethod: null
    };
}

function openQRPaymentModal() {
    if (!currentOrder) return;

    closeCheckoutModal();

    const qrModal = document.getElementById('qrPaymentModal');
    document.getElementById('qrAmount').textContent = `₹${currentOrder.total}`;

    if (typeof generatePaymentQR === 'function') {
        generatePaymentQR(currentOrder.total);
    }

    qrModal.classList.add('show');
}

function closeQRPaymentModal() {
    document.getElementById('qrPaymentModal').classList.remove('show');
}

function completePayment(method) {
    if (!currentOrder) return;

    currentOrder.paymentMethod = method;
    currentOrder.orderId = generateOrderId();
    currentOrder.date = new Date().toISOString();
    completeOrder();
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    modal.classList.remove('show');
}

// Dashboard Navigation
function showDashboard() {
    document.querySelector('.menu-section').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'block';

    if (typeof loadRevenueDashboard === 'function') {
        loadRevenueDashboard();
    }
}

function showMenu() {
    document.querySelector('.menu-section').style.display = 'block';
    document.getElementById('dashboardSection').style.display = 'none';
    if (typeof stopLiveRefresh === 'function') {
        stopLiveRefresh();
    }
}

// LocalStorage Functions
function saveCartToStorage() {
    localStorage.setItem('restaurantCart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('restaurantCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        cart = cart.filter(c => menuItems.some(m => m.id === c.id));
    }
}

// Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--success-color);
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

function getCurrentOrder() {
    return currentOrder;
}

function completeOrder() {
    if (!currentOrder) return null;

    const method = currentOrder.paymentMethod || 'cash';

    const order = {
        orderId: currentOrder.orderId || generateOrderId(),
        date: currentOrder.date || new Date().toISOString(),
        items: currentOrder.items,
        subtotal: currentOrder.subtotal,
        total: currentOrder.total,
        paymentMethod: method,
        status: 'completed'
    };

    if (typeof saveOrder === 'function') {
        saveOrder(order);
    }

    clearCart();
    closeCheckoutModal();
    closeQRPaymentModal();
    showNotification(`Order completed! Payment: ${method === 'cash' ? 'Cash' : 'Online'}`);

    currentOrder = null;
    return order;
}

function generateOrderId() {
    const date = new Date();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${date.getFullYear()}-${String(random).padStart(4, '0')}`;
}

// Settings Modal Functions
function openSettingsModal() {
    const modal = document.getElementById('settingsModal');
    const settings = getRestaurantSettings();

    document.getElementById('restaurantName').value = settings.restaurantName || '';
    document.getElementById('restaurantAddress').value = settings.address || '';
    document.getElementById('restaurantPhone').value = settings.phone || '';
    document.getElementById('upiId').value = settings.upiId || 'restaurant@paytm';

    modal.classList.add('show');
}

function closeSettingsModal() {
    const modal = document.getElementById('settingsModal');
    modal.classList.remove('show');
}

function saveSettings() {
    const restaurantName = document.getElementById('restaurantName').value.trim();
    const address = document.getElementById('restaurantAddress').value.trim();
    const phone = document.getElementById('restaurantPhone').value.trim();
    const upiId = document.getElementById('upiId').value.trim();

    if (!upiId) {
        alert('Please enter a UPI ID. This is required for QR code generation.');
        return;
    }

    const upiIdPattern = /^[\w.-]+@[\w.-]+$/;
    if (!upiIdPattern.test(upiId)) {
        if (!confirm('The UPI ID format looks incorrect. UPI IDs usually look like: yourname@paytm or yourname@ybl\n\nDo you want to save anyway?')) {
            return;
        }
    }

    const settings = {
        restaurantName: restaurantName || 'Restaurant Billing System',
        address: address || '123 Main Street, City, State',
        phone: phone || 'Phone: +91 1234567890',
        upiId: upiId
    };

    localStorage.setItem('restaurantSettings', JSON.stringify(settings));

    showNotification('Settings saved successfully! QR code will use the new UPI ID.');
    closeSettingsModal();
}

function getRestaurantSettings() {
    const settings = localStorage.getItem('restaurantSettings');
    if (settings) {
        return JSON.parse(settings);
    }
    return {
        restaurantName: 'Restaurant Billing System',
        address: '123 Main Street, City, State',
        phone: 'Phone: +91 1234567890',
        upiId: 'restaurant@paytm'
    };
}
