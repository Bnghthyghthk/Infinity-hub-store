// Shopping Cart functionality
let cart = [];

// DOM Elements
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartSummary = document.getElementById('cartSummary');
const emptyCart = document.getElementById('emptyCart');
const governorateSelect = document.getElementById('governorateSelect');
const subtotalEl = document.getElementById('subtotal');
const shippingCostEl = document.getElementById('shippingCost');
const finalTotalEl = document.getElementById('finalTotal');
const customerNameInput = document.getElementById('customerName');
const phoneInput = document.getElementById('phone');
const addressInput = document.getElementById('address');
const submitOrderBtn = document.getElementById('submitOrder');
const notification = document.getElementById('notification');

// Add to Cart buttons
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function() {
        const productCard = this.closest('.product-card');
        const product = {
            id: parseInt(productCard.dataset.id),
            name: productCard.dataset.name,
            price: parseFloat(productCard.dataset.price),
            quantity: 1
        };
        
        addToCart(product);
    });
});

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push(product);
    }
    
    updateCart();
    showNotification('تمت الإضافة للسلة بنجاح!');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

function updateCart() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart items display
    if (cart.length === 0) {
        cartItems.innerHTML = '';
        cartSummary.style.display = 'none';
        emptyCart.style.display = 'block';
    } else {
        emptyCart.style.display = 'none';
        cartSummary.style.display = 'block';
        
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.price} جنيه x ${item.quantity} = ${item.price * item.quantity} جنيه</p>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">إزالة</button>
            </div>
        `).join('');
        
        calculateTotals();
    }
}

function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const selectedOption = governorateSelect.selectedOptions[0];
    const shippingCost = selectedOption ? parseFloat(selectedOption.dataset.price) : 0;
    const finalTotal = subtotal + shippingCost;
    
    subtotalEl.textContent = subtotal;
    shippingCostEl.textContent = shippingCost;
    finalTotalEl.textContent = finalTotal;
    
    return { subtotal, shippingCost, finalTotal };
}

// Governorate selection
governorateSelect.addEventListener('change', calculateTotals);

// Submit order
submitOrderBtn.addEventListener('click', async function() {
    const totals = calculateTotals();
    
    // Validate inputs
    if (!customerNameInput.value.trim()) {
        showNotification('الرجاء إدخال الاسم بالكامل', true);
        return;
    }
    
    if (!phoneInput.value.trim()) {
        showNotification('الرجاء إدخال رقم الهاتف', true);
        return;
    }
    
    if (!addressInput.value.trim()) {
        showNotification('الرجاء إدخال العنوان', true);
        return;
    }
    
    const governorate = governorateSelect.value;
    if (!governorate) {
        showNotification('الرجاء اختيار المحافظة', true);
        return;
    }
    
    // Prepare order data
    const orderData = {
        customerName: customerNameInput.value.trim(),
        phone: phoneInput.value.trim(),
        address: addressInput.value.trim(),
        governorate: governorate,
        products: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        })),
        totalAmount: totals.subtotal,
        shippingCost: totals.shippingCost
    };
    
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(result.message);
            cart = [];
            updateCart();
            customerNameInput.value = '';
            phoneInput.value = '';
            addressInput.value = '';
            governorateSelect.value = '';
            shippingCostEl.textContent = '0';
            finalTotalEl.textContent = '0';
        } else {
            showNotification(result.message || 'حدث خطأ ما', true);
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('حدث خطأ في إرسال الطلب', true);
    }
});

function showNotification(message, isError = false) {
    notification.textContent = message;
    notification.className = 'notification';
    if (isError) {
        notification.classList.add('error');
    }
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Initialize cart on page load
updateCart();
