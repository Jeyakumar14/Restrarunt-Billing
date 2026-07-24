# 🍽️ Restaurant Billing System

A lightweight, responsive Restaurant Billing System built with HTML5, CSS3, and Vanilla JavaScript. Features dynamic menu management, cart checkout, UPI QR code payments, PDF invoice generation, and a real-time revenue analytics dashboard—all running locally in the browser with no backend required.

🔗 **Live Demo:** [Restaurant Billing Software](https://restraruntbillingsoftware.vercel.app/)

---

## ⚡ Key Features

* **Menu Management:** Dynamically add, update, or remove food items with custom pricing and images[cite: 1, 4].
* **Cart & Checkout:** Interactive cart sidebar supporting real-time price calculations and quantity updates[cite: 1, 4].
* **QR Payment Integration:** Generates dynamic UPI QR codes for digital payments[cite: 1, 3, 4].
* **PDF Invoice Generation:** Instant downloading of structured PDF sales receipts via `jsPDF`[cite: 1, 2, 4].
* **Revenue Dashboard:** Sales analytics and order histories for multiple timeframes (Live, 10, 20, 30, and 365 days) or custom date ranges with PDF/CSV export capabilities[cite: 1, 4, 5].
* **Zero Backend Required:** All cart data, active orders, and restaurant settings are saved locally using browser `localStorage`[cite: 4].

---

## 📂 File Overview

```text
├── index.html          # Main HTML structure & UI modals
├── styles.css          # Core styling & responsive layouts
├── script.js           # Main application & cart state logic
├── invoice.js          # jsPDF invoice generation functions
├── revenue.js          # Dashboard analytics & export handling
└── qrcode.js           # UPI QR code generation engine





