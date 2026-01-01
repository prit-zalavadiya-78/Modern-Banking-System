# 🏦 Modern Banking System

A comprehensive client-side banking application built with JavaScript, HTML5, and TailwindCSS. This project demonstrates advanced Object-Oriented Programming (OOP) principles and custom data structures implementation.

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=flat-square&logo=javascript)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

## 🌐 Live Demo

🔗 **[View Live Demo](https://prit-zalavadiya-78.github.io/Modern-Banking-System/HTML/login.html)**

---

## ✨ Features

### 👤 User Management
- **User Registration** with CAPTCHA verification
- **Secure Login/Logout** with session management
- **Profile Management** with unique account numbers

### 💰 Banking Operations
- **Deposit Money** with optional remarks
- **Withdraw Money** with balance validation
- **Money Transfer** to registered payees
- **Transaction History** with detailed records

### 💳 Card Management
- **Debit Card** with customizable transaction limits
- **Credit Card** with higher default limits
- Auto-generated card numbers, CVV, and expiry dates

### 👥 Payee Management
- Add new payees with account validation
- Quick transfers to saved payees
- Prevent self-transfers

### 🏦 Loan System
- Apply for loans with priority levels (Low/Medium/High)
- Track loan application status
- Admin approval/rejection workflow

### 🎫 Support Tickets
- Submit support tickets with detailed descriptions
- Track ticket status (pending/solved)
- Admin resolution system

### 👨‍💼 Admin Panel
- View and process loan requests
- Manage customer queries
- Accept/Reject loan applications
- Solve customer support tickets

---

## 🏗️ Project Architecture

### 📁 Folder Structure
```
Modern-Banking-System/
├── index.html          # Main dashboard
├── login.html          # User login page
├── register.html       # User registration page
├── admin.html          # Admin panel
├── Java Script/
│   ├── classes.js          # OOP class definitions
│   ├── data_structures.js  # Custom data structures
│   ├── script.js           # Main application logic
│   └── admin.js            # Admin panel logic
└── README.md
```

### 🎯 OOP Classes

| Class | Description |
|-------|-------------|
| `User` | Basic user data model |
| `Customer` | Extended user with account, payees, tickets, and loans |
| `Account` | Manages balance, transactions, and cards |
| `Transaction` | Records deposits, withdrawals, and transfers |
| `Payee` | Stores payee information |
| `PaymentMethod` | Base class for payment methods |
| `Card` | Base card class with common functionality |
| `DebitCard` | Debit card with $500 default limit |
| `CreditCard` | Credit card with $1000 default limit |
| `Bank` | Central bank operations and customer management |
| `Admin` | Admin model for managing requests |

### 🔧 Custom Data Structures

| Data Structure | Use Case |
|----------------|----------|
| **DoublyLinkedList** | Transaction history (efficient insertion/deletion) |
| **PriorityQueue** | Loan requests (max-heap based priority) |
| **SimpleQueue** | Support tickets (FIFO processing) |

---

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Modern-Banking-System.git
   ```

2. **Navigate to the project**
   ```bash
   cd Modern-Banking-System
   ```

3. **Open in browser**
   - Open `HTML/login.html` in your web browser
   - Or use a local server like Live Server extension

### First Time Setup

1. Navigate to the **Registration** page
2. Create a new account with:
   - Full Name
   - Email
   - Password (8-16 characters)
   - Complete CAPTCHA verification
3. You'll receive a **14-digit account number** and **$1000 initial balance**

---

### Admin Access

- **Login**: `admin@admin` / `admin`
- **Features**:
  - View pending loan requests
  - Accept or reject loans
  - View customer queries
  - Resolve support tickets

---

## 💾 Data Storage

This application uses **browser localStorage** and **sessionStorage** for data persistence:

| Storage Type | Purpose |
|--------------|---------|
| `localStorage` | User data, admin data, persistent storage |
| `sessionStorage` | Current session, logged-in user tracking |

> ⚠️ **Note**: Clearing browser data will reset all application data.

---

## 🛠️ Technical Highlights

### OOP Concepts Demonstrated
- **Encapsulation**: Private fields using `#` syntax
- **Inheritance**: Card hierarchy (PaymentMethod → Card → DebitCard/CreditCard)
- **Polymorphism**: Method overriding in subclasses
- **Abstraction**: Clean interfaces for complex operations

### Data Structure Implementation
- **Doubly Linked List**: O(1) insertion at head/tail
- **Binary Max-Heap**: Priority queue for loan prioritization
- **FIFO Queue**: First-come-first-served ticket processing

### Security Features
- Password length validation (8-16 characters)
- CAPTCHA verification on registration
- Session-based authentication
- Account number validation for transfers

---

## 🔮 Future Enhancements

- [ ] Backend integration with Node.js/Express
- [ ] Database storage (MongoDB/PostgreSQL)
- [ ] Password hashing and encryption
- [ ] Email notifications
- [ ] Mobile responsive improvements
- [ ] Transaction export (PDF/CSV)
- [ ] Two-factor authentication
- [ ] Interest calculation on savings

---

<p align="center">
  Made with ❤️ for learning OOP and Data Structures in JavaScript
</p>
