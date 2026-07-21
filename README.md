# Quick Cart 🛒

Welcome to **Quick Cart**, a next-generation hyper-local e-commerce platform built to revolutionize the online shopping and delivery experience. With advanced routing, real-time inventory, and seamless delivery batching, Quick Cart ensures that your products reach you faster than ever.

---

## 🌟 The Vision: Existing Models vs. Our Model

### 📉 The Problem with Existing E-commerce Models

- **Slower Deliveries:** Traditional models rely on centralized warehouses resulting in 2-3 day delivery windows.
- **Unoptimized Logistics:** Single-order delivery dispatched without batching leads to higher costs and longer wait times.
- **Disjointed Ecosystems:** Separate tools for customers, sellers, and delivery partners result in poor real-time communication.
- **Opaque Tracking:** Customers lack genuine, live updates regarding their order location and status.

### 🚀 Our Innovative Approach (The Quick Cart Model)

- **Hyper-Local Fulfillment:** By integrating with nearby stores and local vendors, we drastically cut down the distance between the product and the customer.
- **Smart Delivery Batching:** Utilizing an advanced backend algorithm, orders in the same vicinity are grouped for a single delivery partner, maximizing efficiency and reducing carbon footprint.
- **Unified Unified Dashboards:** Dedicated React-based dashboards for **Customers**, **Store Owners**, **System Admins**, and **Delivery Partners** ensuring complete transparency.
- **Real-Time Data Flow:** Instant state updates using modern Java Spring Boot backend and robust API architecture.

---

## ✨ Key Features

### For Customers 🛍️

- Seamless product discovery and search functionalities.
- Quick cart modifications and frictionless checkout process.
- Live order tracking and estimated delivery time.

### For Delivery Partners 🚚

- **Delivery Batching:** Smart grouping of orders for optimal route coverage.
- Intuitive delivery dashboard to update statuses (Picked up, In-transit, Delivered).

### For Store Admins 🏪

- Effortless inventory and product management.
- Real-time notification of new incoming orders.

### For System Admins 👨‍💻

- Comprehensive bird's-eye view of platform metrics.
- Store approval and user role management.

---

## 🛠️ Technology Stack

Our platform is engineered for scalability, speed, and reliability:

- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons, Recharts (for analytics).
- **Backend:** Java, Spring Boot, Maven.
- **Database:** Relational Database (managed by DB admin).
- **Architecture:** RESTful API Design.

---

## 🤝 Meet the Team

| Name | Role | GitHub Profile |
| :--- | :--- | :--- |
| **Shashank** | Backend Developer | [@shashanktechi](https://github.com/shashanktechi) |
| **Y N Sagar** | Frontend Developer | [@Mynameissagar](https://github.com/Mynameissagar) |
| **Santhosh** | Database Administrator | [@Santhosh-767](https://github.com/Santhosh-767) |
| **Sai** | Deployment & Maintenance | [@sai-u13](https://github.com/sai-u13) |

---

## 🚀 How to Run the Project

Follow these steps to set up the project locally on your machine.

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Java Development Kit (JDK)](https://www.oracle.com/java/technologies/downloads/) (v17 or higher)
- [Maven](https://maven.apache.org/)
- A relational database instance (MySQL/PostgreSQL) running locally.

### 1. Backend Setup (Spring Boot)

Open a terminal and navigate to the backend directory:

```bash
# Navigate to the backend directory
cd backend

# Configure your database credentials
# (Create/Edit the .env or application.properties file as per your DB setup)

# Clean and build the project using Maven wrapper
./mvnw clean install

# Run the Spring Boot application
./mvnw spring-boot:run
```

*The backend API will typically start on `http://localhost:8080`.*

### 2. Frontend Setup (React + Vite)

Open a new terminal window and navigate to the frontend directory:

```bash
# Navigate to the frontend directory
cd frontend

# Install the necessary dependencies
npm install

# Start the Vite development server
npm run dev
```

*The frontend application will typically be accessible at `http://localhost:5173`.*

---

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for more information.
