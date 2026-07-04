// Invoice Generation using jsPDF

document.addEventListener('DOMContentLoaded', () => {
    const cashBtn = document.getElementById('generateInvoiceCashBtn');
    const onlineBtn = document.getElementById('generateInvoiceOnlineBtn');

    if (cashBtn) {
        cashBtn.addEventListener('click', () => generateInvoicePDF('cash'));
    }
    if (onlineBtn) {
        onlineBtn.addEventListener('click', () => generateInvoicePDF('online'));
    }
});

function generateInvoicePDF(paymentMethod) {
    const order = getCurrentOrder();
    if (!order) {
        alert('No order found. Please proceed to checkout first.');
        return;
    }

    order.paymentMethod = paymentMethod;
    order.orderId = order.orderId || generateOrderId();
    order.date = order.date || new Date().toISOString();

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const settings = getRestaurantSettings();
    const restaurantName = settings.restaurantName || 'Restaurant Billing System';
    const restaurantAddress = settings.address || '123 Main Street, City, State';
    const restaurantPhone = settings.phone || 'Phone: +91 1234567890';

    const primaryColor = [255, 107, 53];
    const darkColor = [44, 62, 80];
    const lightColor = [236, 240, 241];

    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(restaurantName, 105, 20, { align: 'center' });

    doc.setTextColor(...darkColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(restaurantAddress, 105, 30, { align: 'center' });
    doc.text(restaurantPhone, 105, 36, { align: 'center' });

    let yPos = 50;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 20, yPos);

    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const orderId = order.orderId;
    const orderDate = new Date(order.date).toLocaleString();
    const paymentLabel = paymentMethod === 'cash' ? 'Cash' : 'Online (UPI)';

    doc.text(`Order ID: ${orderId}`, 20, yPos);
    doc.text(`Date: ${orderDate}`, 20, yPos + 6);
    doc.text(`Payment: ${paymentLabel}`, 20, yPos + 12);

    yPos += 22;

    doc.setFillColor(...lightColor);
    doc.rect(20, yPos, 170, 10, 'F');

    doc.setFont('helvetica', 'bold');
    doc.text('Item', 25, yPos + 7);
    doc.text('Qty', 100, yPos + 7);
    doc.text('Price', 130, yPos + 7);
    doc.text('Total', 170, yPos + 7);

    yPos += 15;

    doc.setFont('helvetica', 'normal');
    order.items.forEach(item => {
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }

        doc.text(item.name, 25, yPos);
        doc.text(String(item.quantity), 100, yPos);
        doc.text(`₹${item.price}`, 130, yPos);
        doc.text(`₹${item.total}`, 170, yPos);
        yPos += 8;
    });

    yPos += 5;

    doc.setDrawColor(...darkColor);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Subtotal:', 130, yPos);
    doc.text(`₹${order.subtotal}`, 170, yPos);
    yPos += 8;

    doc.setFontSize(14);
    doc.setFillColor(...primaryColor);
    doc.rect(120, yPos - 5, 70, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Total:', 130, yPos + 2);
    doc.text(`₹${order.total}`, 170, yPos + 2);

    yPos += 20;

    doc.setTextColor(...darkColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your order!', 105, yPos, { align: 'center' });
    yPos += 6;
    doc.text(`Paid via ${paymentLabel}`, 105, yPos, { align: 'center' });

    const fileName = `Invoice_${orderId}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    completeOrder();
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

function generateOrderId() {
    const date = new Date();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${date.getFullYear()}-${String(random).padStart(4, '0')}`;
}
