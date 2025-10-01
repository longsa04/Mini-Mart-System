# Mini Mart System  

A full-stack **Point-of-Sale (POS) and back-office management system** designed for small retail operations such as minimarts and groceries.  
Built with **Spring Boot, React, and MySQL**, the system supports cashier checkouts, admin dashboards, and role-based security, streamlining daily retail workflows.  

---

## Overview  

The Mini Mart System integrates:  

- **Backend (Spring Boot 3.5.5, Java 21)**: REST API with Spring Data JPA, Spring Security, JWT authentication, and MySQL connector.  
- **Frontend (React 18 + Vite)**: Modern SPA with Bootstrap styling, axios API clients, and receipt printing (html2canvas + jsPDF).  
- **Database (MySQL)**: Pre-seeded schema covering core entities such as activity logs, categories, cash registers, customers, expenses, orders, and products.  

---

## Features  

- **Operations Dashboard**  
  Summarizes revenue, sales trends, pending payments, recent orders, low stock alerts, top products, and loyalty leaders.  

- **Role-Based Navigation**  
  Tailors menus and permissions for admins, managers, and cashiers, surfacing relevant operations, inventory, purchasing, and reporting tools.  

- **POS Checkout**  
  Fast checkout flow with barcode scanning, keyword search, cart editing, cash handling with change calculation, order submission, and printable receipts tagged with cashier and branch.  

- **Audit Trail**  
  Records login events and operations, auto-refreshes every 10 seconds, and provides metadata (user, role, timestamp) in an admin-friendly activity log.  

- **Extensible REST API**  
  CRUD endpoints for core retail entities with granular role-based security checks.  

---

## Project Structure  

cmspos-backend/ # Spring Boot API and Maven wrapper
Frontend-MiniMart/ # React/Vite single-page application
Database/pos.sql # MySQL schema and sample data


---

## Getting Started  

### Prerequisites  
- Java 21  
- Maven 3.9+  
- Node.js 18+  
- MySQL 8.0+  

### Installation  

1. **Clone the repository**  
    ```bash
     git clone https://github.com/yourusername/mini-mart-system.git
     cd mini-mart-system
   

2. **Backend Setup**  

    ```bash
    cd cmspos-backend
    ./mvnw spring-boot:run


### Configure your # application.properties # with MySQL credentials before running.

3. **Frontend Setup**

    ```bash
    cd Frontend-MiniMart
    npm install
    npm run dev


### 4. Database Setup  

- Import `Database/pos.sql` into MySQL  
- Ensure schema and seed data are loaded  

---

## Demo Accounts  

| Role    | Username | Password |
|---------|----------|----------|
| Admin   | admin    | admin    |
| Admin   | manager  | manager  |
| Cashier | cashier  | cashier  |

---

## License  

This project is released under the **MIT License**.  
You are free to use, modify, and distribute it for educational or commercial purposes.  
