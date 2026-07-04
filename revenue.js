// Revenue Tracking and Analytics

let allOrders = [];
let liveRefreshInterval = null;
let currentPeriod = 'live';

document.addEventListener('DOMContentLoaded', () => {
    loadOrdersFromStorage();
    setupPeriodButtons();
    setupDateRangeReport();
    setupLiveSync();
});

function setupPeriodButtons() {
    const periodButtons = document.querySelectorAll('.period-btn');
    periodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            periodButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentPeriod = btn.getAttribute('data-period');
            toggleCustomDateSection(currentPeriod === 'custom');
            if (currentPeriod === 'custom') {
                const startInput = document.getElementById('reportStartDate');
                if (!startInput?.value) setDateRangeToLastWeek();
            }
            applyPeriodFilter(currentPeriod);
        });
    });

    if (periodButtons.length > 0) {
        applyPeriodFilter('live');
    }
}

function toggleCustomDateSection(show) {
    const section = document.getElementById('customDateSection');
    if (section) {
        section.style.display = show ? 'block' : 'none';
    }
}

function setupDateRangeReport() {
    const startInput = document.getElementById('reportStartDate');
    const endInput = document.getElementById('reportEndDate');
    const presetWeekBtn = document.getElementById('presetWeekBtn');
    const applyBtn = document.getElementById('applyDateRangeBtn');
    const pdfBtn = document.getElementById('downloadReportPdfBtn');
    const csvBtn = document.getElementById('downloadReportCsvBtn');

    if (!startInput || !endInput) return;

    setDateRangeToLastWeek();

    presetWeekBtn?.addEventListener('click', () => {
        setDateRangeToLastWeek();
        if (currentPeriod === 'custom') {
            applyCustomDateRange();
        }
    });

    applyBtn?.addEventListener('click', applyCustomDateRange);
    pdfBtn?.addEventListener('click', () => downloadSalesReport('pdf'));
    csvBtn?.addEventListener('click', () => downloadSalesReport('csv'));
}

function formatDateForInput(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function setDateRangeToLastWeek() {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);

    const startInput = document.getElementById('reportStartDate');
    const endInput = document.getElementById('reportEndDate');
    if (startInput) startInput.value = formatDateForInput(start);
    if (endInput) endInput.value = formatDateForInput(end);
}

function getSelectedDateRange(silent = false) {
    const startInput = document.getElementById('reportStartDate');
    const endInput = document.getElementById('reportEndDate');

    if (!startInput?.value || !endInput?.value) {
        if (!silent) alert('Please select both start and end dates.');
        return null;
    }

    const start = new Date(startInput.value + 'T00:00:00');
    const end = new Date(endInput.value + 'T23:59:59.999');

    if (start > end) {
        if (!silent) alert('Start date must be on or before end date.');
        return null;
    }

    return { start, end, startLabel: startInput.value, endLabel: endInput.value };
}

function filterOrdersByDateRange(start, end) {
    return allOrders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= start && orderDate <= end;
    });
}

function applyCustomDateRange() {
    const range = getSelectedDateRange();
    if (!range) return;

    loadOrdersFromStorage();
    const filteredOrders = filterOrdersByDateRange(range.start, range.end);
    displayRevenueStats(filteredOrders, 'custom');
    displayOrderHistory(filteredOrders);
    updateReportRangeLabel(range.startLabel, range.endLabel, filteredOrders.length);
    stopLiveRefresh();
    updateLiveBadge('custom');
}

function updateReportRangeLabel(startLabel, endLabel, orderCount) {
    const label = document.getElementById('reportRangeLabel');
    if (label) {
        label.textContent = `Showing ${orderCount} order(s) from ${formatDisplayDate(startLabel)} to ${formatDisplayDate(endLabel)}`;
    }
}

function formatDisplayDate(isoDate) {
    const d = new Date(isoDate + 'T12:00:00');
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function downloadSalesReport(format) {
    const range = getSelectedDateRange();
    if (!range) return;

    loadOrdersFromStorage();
    const orders = filterOrdersByDateRange(range.start, range.end);

    if (orders.length === 0) {
        alert('No orders found for the selected date range.');
        return;
    }

    if (format === 'pdf') {
        generateSalesReportPDF(orders, range);
    } else {
        generateSalesReportCSV(orders, range);
    }
}

function getReportSummary(orders) {
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const cashRevenue = orders.filter(o => o.paymentMethod === 'cash').reduce((sum, o) => sum + o.total, 0);
    const onlineRevenue = orders.filter(o => o.paymentMethod === 'online').reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return { totalRevenue, cashRevenue, onlineRevenue, totalOrders, avgOrderValue };
}

function getRestaurantSettingsForReport() {
    const settings = localStorage.getItem('restaurantSettings');
    if (settings) return JSON.parse(settings);
    return {
        restaurantName: 'Restaurant Billing System',
        address: '123 Main Street, City, State',
        phone: 'Phone: +91 1234567890'
    };
}

function generateSalesReportPDF(orders, range) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const settings = getRestaurantSettingsForReport();
    const summary = getReportSummary(orders);
    const sortedOrders = [...orders].sort((a, b) => new Date(a.date) - new Date(b.date));

    const primaryColor = [255, 107, 53];
    const darkColor = [44, 62, 80];
    const lightColor = [236, 240, 241];

    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(settings.restaurantName || 'Restaurant', 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Sales Report', 105, 25, { align: 'center' });

    let yPos = 45;
    doc.setTextColor(...darkColor);
    doc.setFontSize(11);
    doc.text(`Period: ${formatDisplayDate(range.startLabel)} — ${formatDisplayDate(range.endLabel)}`, 20, yPos);
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 20, yPos + 7);
    yPos += 18;

    doc.setFillColor(...lightColor);
    doc.rect(20, yPos, 170, 28, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Summary', 25, yPos + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Revenue: ₹${summary.totalRevenue.toFixed(2)}`, 25, yPos + 16);
    doc.text(`Cash: ₹${summary.cashRevenue.toFixed(2)}  |  Online: ₹${summary.onlineRevenue.toFixed(2)}`, 25, yPos + 22);
    doc.text(`Orders: ${summary.totalOrders}  |  Avg Order: ₹${summary.avgOrderValue.toFixed(2)}`, 110, yPos + 16);
    yPos += 38;

    doc.setFillColor(...lightColor);
    doc.rect(20, yPos, 170, 9, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Order ID', 22, yPos + 6);
    doc.text('Date', 52, yPos + 6);
    doc.text('Items', 85, yPos + 6);
    doc.text('Payment', 145, yPos + 6);
    doc.text('Total', 175, yPos + 6);
    yPos += 14;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    sortedOrders.forEach(order => {
        if (yPos > 275) {
            doc.addPage();
            yPos = 20;
        }

        const orderDate = new Date(order.date).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
        });
        const items = order.items.map(i => `${i.name} x${i.quantity}`).join(', ');
        const payment = order.paymentMethod === 'online' ? 'Online' : 'Cash';
        const truncatedItems = items.length > 35 ? items.slice(0, 32) + '...' : items;

        doc.text(order.orderId, 22, yPos);
        doc.text(orderDate, 52, yPos);
        doc.text(truncatedItems, 85, yPos);
        doc.text(payment, 145, yPos);
        doc.text(`₹${order.total}`, 175, yPos);
        yPos += 7;
    });

    const fileName = `Sales_Report_${range.startLabel}_to_${range.endLabel}.pdf`;
    doc.save(fileName);
}

function generateSalesReportCSV(orders, range) {
    const summary = getReportSummary(orders);
    const sortedOrders = [...orders].sort((a, b) => new Date(a.date) - new Date(b.date));
    const settings = getRestaurantSettingsForReport();

    const rows = [
        ['Sales Report', settings.restaurantName || 'Restaurant'],
        ['Period', `${range.startLabel} to ${range.endLabel}`],
        ['Generated', new Date().toLocaleString('en-IN')],
        [],
        ['Summary'],
        ['Total Revenue', summary.totalRevenue.toFixed(2)],
        ['Cash Revenue', summary.cashRevenue.toFixed(2)],
        ['Online Revenue', summary.onlineRevenue.toFixed(2)],
        ['Total Orders', summary.totalOrders],
        ['Average Order Value', summary.avgOrderValue.toFixed(2)],
        [],
        ['Order ID', 'Date & Time', 'Items', 'Payment Method', 'Subtotal', 'Total']
    ];

    sortedOrders.forEach(order => {
        const items = order.items.map(i => `${i.name} (${i.quantity})`).join('; ');
        const payment = order.paymentMethod === 'online' ? 'Online' : 'Cash';
        rows.push([
            order.orderId,
            new Date(order.date).toLocaleString('en-IN'),
            items,
            payment,
            order.subtotal ?? order.total,
            order.total
        ]);
    });

    const csvContent = rows.map(row =>
        row.map(cell => {
            const str = String(cell ?? '');
            return str.includes(',') || str.includes('"') || str.includes('\n')
                ? `"${str.replace(/"/g, '""')}"`
                : str;
        }).join(',')
    ).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Sales_Report_${range.startLabel}_to_${range.endLabel}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
}

function setupLiveSync() {
    window.addEventListener('storage', (e) => {
        if (e.key === 'restaurantOrders') {
            loadOrdersFromStorage();
            if (isDashboardVisible()) {
                applyPeriodFilter(currentPeriod);
            }
        }
    });
}

function isDashboardVisible() {
    const dashboardSection = document.getElementById('dashboardSection');
    return dashboardSection && dashboardSection.style.display !== 'none';
}

function applyPeriodFilter(period) {
    loadOrdersFromStorage();
    filterOrdersByPeriod(period);
    updateLiveBadge(period);

    if (period === 'live' && isDashboardVisible()) {
        startLiveRefresh();
    } else {
        stopLiveRefresh();
    }
}

function startLiveRefresh() {
    stopLiveRefresh();
    liveRefreshInterval = setInterval(() => {
        if (isDashboardVisible() && currentPeriod === 'live') {
            loadOrdersFromStorage();
            filterOrdersByPeriod('live');
        } else {
            stopLiveRefresh();
        }
    }, 3000);
}

function stopLiveRefresh() {
    if (liveRefreshInterval) {
        clearInterval(liveRefreshInterval);
        liveRefreshInterval = null;
    }
}

function updateLiveBadge(period) {
    const badge = document.getElementById('liveBadge');
    if (badge) {
        badge.style.display = period === 'live' ? 'inline-flex' : 'none';
    }
}

function saveOrder(order) {
    allOrders.push(order);
    saveOrdersToStorage();
    updateRevenueDisplay();
}

function loadOrdersFromStorage() {
    const savedOrders = localStorage.getItem('restaurantOrders');
    if (savedOrders) {
        allOrders = JSON.parse(savedOrders);
    } else {
        allOrders = [];
    }
}

function saveOrdersToStorage() {
    localStorage.setItem('restaurantOrders', JSON.stringify(allOrders));
}

function filterOrdersByPeriod(period) {
    const now = new Date();
    let filteredOrders;

    if (period === 'live') {
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        filteredOrders = allOrders.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate >= startOfToday && orderDate <= now;
        });
    } else if (period === 'custom') {
        const range = getSelectedDateRange(true);
        if (range) {
            filteredOrders = filterOrdersByDateRange(range.start, range.end);
            updateReportRangeLabel(range.startLabel, range.endLabel, filteredOrders.length);
        } else {
            filteredOrders = [];
        }
    } else {
        const days = parseInt(period, 10);
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - days);
        filteredOrders = allOrders.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate >= startDate && orderDate <= now;
        });
    }

    displayRevenueStats(filteredOrders, period);
    displayOrderHistory(filteredOrders);
}

function displayRevenueStats(orders, period) {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const cashRevenue = orders
        .filter(o => o.paymentMethod === 'cash')
        .reduce((sum, order) => sum + order.total, 0);
    const onlineRevenue = orders
        .filter(o => o.paymentMethod === 'online')
        .reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toFixed(2)}`;
    document.getElementById('cashRevenue').textContent = `₹${cashRevenue.toFixed(2)}`;
    document.getElementById('onlineRevenue').textContent = `₹${onlineRevenue.toFixed(2)}`;
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('avgOrderValue').textContent = `₹${avgOrderValue.toFixed(2)}`;

    const lastUpdated = document.getElementById('lastUpdated');
    if (lastUpdated) {
        if (period === 'live') {
            lastUpdated.textContent = `Updated ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
        } else {
            lastUpdated.textContent = '';
        }
    }
}

function displayOrderHistory(orders) {
    const tableBody = document.getElementById('orderTableBody');

    if (orders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem; color: #999;">
                    No orders found for this period
                </td>
            </tr>
        `;
        return;
    }

    const sortedOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));

    tableBody.innerHTML = sortedOrders.map(order => {
        const orderDate = new Date(order.date);
        const formattedDate = orderDate.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const itemsList = order.items.map(item =>
            `${item.name} (${item.quantity})`
        ).join(', ');

        const paymentBadge = order.paymentMethod === 'online'
            ? '<span class="payment-badge payment-online">Online</span>'
            : '<span class="payment-badge payment-cash">Cash</span>';

        return `
            <tr>
                <td>${order.orderId}</td>
                <td>${formattedDate}</td>
                <td>${itemsList}</td>
                <td>${paymentBadge}</td>
                <td><strong>₹${order.total}</strong></td>
            </tr>
        `;
    }).join('');
}

function loadRevenueDashboard() {
    const activeBtn = document.querySelector('.period-btn.active');
    if (activeBtn) {
        currentPeriod = activeBtn.getAttribute('data-period');
    } else {
        currentPeriod = 'live';
    }
    toggleCustomDateSection(currentPeriod === 'custom');
    if (currentPeriod === 'custom') {
        setDateRangeToLastWeek();
    }
    applyPeriodFilter(currentPeriod);
}

function updateRevenueDisplay() {
    if (isDashboardVisible()) {
        applyPeriodFilter(currentPeriod);
    }
}

function getAllOrders() {
    return allOrders;
}

function getRevenueForPeriod(days) {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    const filteredOrders = allOrders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= startDate && orderDate <= now;
    });

    return {
        totalRevenue: filteredOrders.reduce((sum, order) => sum + order.total, 0),
        totalOrders: filteredOrders.length,
        orders: filteredOrders
    };
}
