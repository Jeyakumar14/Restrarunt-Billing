// QR Code Generation for Payment

let qrCodeInstance = null;

// Generate Payment QR Code
function generatePaymentQR(amount) {
    const qrContainer = document.getElementById('qrcode');
    
    // Clear previous QR code
    if (qrContainer) {
        qrContainer.innerHTML = '';
    }

    // Get UPI ID from settings
    const settings = getRestaurantSettings();
    const upiId = settings.upiId || 'restaurant@paytm';
    
    // Create UPI payment string
    // Format: upi://pay?pa=<UPI_ID>&am=<AMOUNT>&cu=INR&tn=<TRANSACTION_NOTE>
    const paymentString = `upi://pay?pa=${upiId}&am=${amount}&cu=INR&tn=Restaurant%20Bill`;
    
    // Alternative: Simple payment link format
    // Some UPI apps support: <upi_id>?amount=<amount>
    const simplePaymentString = `${upiId}?amount=${amount}`;

    // Generate QR code using QRCode.js library
    if (typeof QRCode !== 'undefined') {
        qrCodeInstance = new QRCode(qrContainer, {
            text: paymentString,
            width: 200,
            height: 200,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });

        // Add click to copy UPI ID
        qrContainer.style.cursor = 'pointer';
        qrContainer.title = 'Click to copy UPI ID';
        qrContainer.onclick = () => {
            copyToClipboard(upiId);
            showQRNotification('UPI ID copied to clipboard!');
        };
    } else {
        // Fallback if QRCode library is not loaded
        qrContainer.innerHTML = `
            <div style="
                width: 200px;
                height: 200px;
                background: #f0f0f0;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px dashed #ccc;
                border-radius: 10px;
                flex-direction: column;
                padding: 1rem;
            ">
                <p style="font-size: 0.9rem; color: #666; text-align: center;">
                    QR Code library not loaded.<br>
                    UPI ID: ${upiId}<br>
                    Amount: ₹${amount}
                </p>
            </div>
        `;
    }
}

// Get Restaurant Settings
function getRestaurantSettings() {
    const settings = localStorage.getItem('restaurantSettings');
    if (settings) {
        return JSON.parse(settings);
    }
    
    // Default settings
    const defaultSettings = {
        restaurantName: 'Restaurant Billing System',
        address: '123 Main Street, City, State',
        phone: 'Phone: +91 1234567890',
        upiId: 'restaurant@paytm'
    };
    
    // Save default settings if not exists
    localStorage.setItem('restaurantSettings', JSON.stringify(defaultSettings));
    
    return defaultSettings;
}

// Copy to Clipboard
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(err => {
            console.error('Failed to copy:', err);
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

// Fallback Copy Method
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
    } catch (err) {
        console.error('Fallback copy failed:', err);
    }
    
    document.body.removeChild(textArea);
}

// Show QR Notification
function showQRNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--success-color, #2ecc71);
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 4000;
        font-size: 1.1rem;
        animation: fadeInOut 2s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// Add fade animation for notification
if (!document.getElementById('qrNotificationStyle')) {
    const style = document.createElement('style');
    style.id = 'qrNotificationStyle';
    style.textContent = `
        @keyframes fadeInOut {
            0%, 100% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8);
            }
            50% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize QR Code when checkout modal opens
document.addEventListener('DOMContentLoaded', () => {
    // This will be called when checkout modal is opened
    // The generatePaymentQR function will be called from script.js
});






