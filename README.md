# Restaurant Billing System

A complete restaurant billing software built with vanilla JavaScript, HTML, and CSS. This system handles menu items, cart management, invoice generation, revenue tracking, and QR code payment integration.

## Features

- **Menu Management**: Display menu items with images and prices
- **Cart Functionality**: Add, remove, and update item quantities
- **Invoice Generation**: Generate and download PDF invoices
- **Revenue Tracking**: Track revenue for 1 day, 20 days, 30 days, or 1 year
- **QR Code Payment**: Generate QR codes for UPI payments
- **Local Storage**: All data is persisted in browser localStorage

## Menu Items

- **Idly**: ₹10
- **Dosa**: ₹40
- **Parotta**: ₹20
- **Omelette**: ₹10

## Setup Instructions

1. **Open the Application**
   - Simply open `index.html` in a modern web browser
   - No build process or server required

2. **External Libraries**
   - The application uses CDN links for:
     - jsPDF (for PDF generation)
     - QRCode.js (for QR code generation)
   - These are automatically loaded from CDN

3. **First Time Setup**
   - The application will work out of the box
   - Default UPI ID is set to `restaurant@paytm`
   - You can modify settings by editing localStorage or adding a settings page

## Usage

### Adding Items to Cart
1. Browse the menu items
2. Click "Add to Cart" on any item
3. View your cart by clicking the "Cart" button in the header

### Managing Cart
- Use `+` and `-` buttons to adjust quantities
- Click "Remove" to remove an item completely
- View total at the bottom of the cart

### Checkout
1. Click "Proceed to Checkout" when ready
2. Review your order summary
3. Scan the QR code to make payment
4. Click "Generate Invoice" to download PDF invoice
5. Order will be automatically saved to revenue tracking

### Revenue Dashboard
1. Click "Revenue Dashboard" in the header
2. Select a time period (1 Day, 20 Days, 30 Days, or 1 Year)
3. View:
   - Total Revenue
   - Total Orders
   - Average Order Value
   - Order History Table

## File Structure

```
restaurant-billing/
├── index.html          # Main HTML structure
├── styles.css          # All styling
├── script.js           # Main application logic
├── invoice.js          # Invoice generation & PDF export
├── revenue.js          # Revenue tracking & analytics
├── qrcode.js           # QR code generation for payments
└── README.md           # This file
```

## Data Storage

All data is stored in browser localStorage:
- `restaurantCart`: Current cart items
- `restaurantOrders`: All completed orders
- `restaurantSettings`: Restaurant settings (UPI ID, name, etc.)

## Customization

### Change UPI ID
You can modify the UPI ID by editing the `getRestaurantSettings()` function in `qrcode.js` or by setting it in localStorage:

```javascript
const settings = {
    restaurantName: 'Your Restaurant Name',
    address: 'Your Address',
    phone: 'Your Phone',
    upiId: 'your-upi-id@paytm'
};
localStorage.setItem('restaurantSettings', JSON.stringify(settings));
```

### Add More Menu Items
Edit the `menuItems` array in `script.js`:

```javascript
const menuItems = [
    {
        id: 5,
        name: "New Item",
        price: 50,
        image: "https://image-url.com/image.jpg"
    },
    // ... existing items
];
```

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Notes

- Images are loaded from Unsplash. If images fail to load, placeholder images will be shown.
- QR codes are generated using QRCode.js library loaded from CDN.
- PDF invoices are generated using jsPDF library loaded from CDN.
- All data is stored locally in your browser - no server required.

## Future Enhancements

- Add tax calculation
- Print invoice option
- Export revenue data to CSV/Excel
- Multiple payment methods
- Order status tracking
- Customer management

## License

This project is open source and available for use.






