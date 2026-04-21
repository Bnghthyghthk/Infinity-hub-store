// Admin Dashboard JavaScript

const notification = document.getElementById('notification');

// Filter orders by status
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const filter = this.dataset.filter;
        filterOrders(filter);
    });
});

function filterOrders(status) {
    const orderCards = document.querySelectorAll('.order-card');
    
    orderCards.forEach(card => {
        if (status === 'all' || card.dataset.status === status) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Update order status
document.querySelectorAll('.update-status-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
        const orderId = this.dataset.orderId;
        const select = document.querySelector(`.status-select[data-order-id="${orderId}"]`);
        const newStatus = select.value;
        
        try {
            const response = await fetch(`/api/orders/${orderId}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('تم تحديث حالة الطلب بنجاح');
                
                // Update the badge
                const card = document.querySelector(`.order-card[data-id="${orderId}"]`);
                const badge = card.querySelector('.status-badge');
                badge.className = `status-badge status-${newStatus}`;
                badge.textContent = getStatusText(newStatus);
                card.dataset.status = newStatus;
            } else {
                showNotification(result.message || 'حدث خطأ ما', true);
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('حدث خطأ في تحديث الحالة', true);
        }
    });
});

function getStatusText(status) {
    const texts = {
        'pending': 'قيد المعالجة',
        'confirmed': 'مؤكد',
        'shipped': 'تم الشحن',
        'delivered': 'تم التسليم'
    };
    return texts[status] || status;
}

// Update shipping rates
document.querySelectorAll('.update-shipping-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
        const governorate = this.dataset.governorate;
        const input = document.querySelector(`input[data-governorate="${governorate}"]`);
        const newPrice = input.value;
        
        if (!newPrice || newPrice < 0) {
            showNotification('الرجاء إدخال سعر صحيح', true);
            return;
        }
        
        try {
            const response = await fetch('/api/shipping-rates/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ governorate, price: newPrice })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('تم تحديث سعر الشحن بنجاح');
                
                // Update the option in the main store dropdown
                const option = document.querySelector(`#governorateSelect option[value="${governorate}"]`);
                if (option) {
                    option.textContent = `${governorate} - ${newPrice} جنيه`;
                    option.dataset.price = newPrice;
                }
            } else {
                showNotification(result.message || 'حدث خطأ ما', true);
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('حدث خطأ في تحديث السعر', true);
        }
    });
});

// Add new product
const addProductForm = document.getElementById('addProductForm');
if (addProductForm) {
    addProductForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const productData = {
            name: document.getElementById('productName').value.trim(),
            price: document.getElementById('productPrice').value,
            category: document.getElementById('productCategory').value.trim(),
            image: document.getElementById('productImage').value.trim()
        };
        
        if (!productData.name || !productData.price || !productData.category) {
            showNotification('الرجاء ملء جميع الحقول المطلوبة', true);
            return;
        }
        
        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('تم إضافة المنتج بنجاح');
                addProductForm.reset();
                
                // Reload page to show new product
                setTimeout(() => {
                    location.reload();
                }, 1500);
            } else {
                showNotification(result.message || 'حدث خطأ ما', true);
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('حدث خطأ في إضافة المنتج', true);
        }
    });
}

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

// Load orders dynamically (optional - for AJAX updates)
async function loadOrders() {
    try {
        const response = await fetch('/api/orders');
        const orders = await response.json();
        console.log('Orders loaded:', orders);
        // You can add logic to refresh the orders list without page reload
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Auto-refresh orders every 30 seconds
setInterval(loadOrders, 30000);
