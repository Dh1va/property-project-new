# 🏠 Property Management Platform

A full-stack property management web application built with **React + Vite**, **Node.js + Express**, and **MongoDB**, featuring role-based authentication, Admin/Seller dashboards, and a complete property enquiry workflow.

This project focuses on real-world architecture, secure authentication, and scalable CRUD systems.

---

## 🚀 Features

### 🔐 Authentication & Authorization

- JWT-based login system  
- Role-based access control (Admin / Seller)  
- Protected routes on frontend and backend  
- Secure password hashing  
- Token validation middleware  

---

### 👤 Roles

#### Admin

- View all properties  
- Add / edit / delete any property  
- Manage sellers  
- View and manage enquiries  
- Full platform access  

#### Seller

- Register & login  
- Add new properties  
- Edit / delete own properties only  
- View enquiries related to their listings  

---

### 🏘 Property Management

- Add property with multiple images  
- Image upload via Cloudinary  
- Update property details  
- Delete property with confirmation  
- Dynamic property listing (no static data)  
- Ownership validation on every request  

---

### 📩 Enquiry System

- Public enquiry form  
- Auto-generated reference number  
- Email notification flow  
- Admin dashboard for enquiries  
- Seller-specific enquiry visibility  

---

### 📊 Dashboards

- Separate Admin and Seller dashboards  
- Sidebar navigation  
- Role-based menu rendering  
- Confirmation dialogs for destructive actions  

---

## 🧱 Tech Stack

### Frontend

- React + Vite  
- Tailwind CSS  
- React Router  
- Framer Motion  
- Axios  

### Backend

- Node.js  
- Express  
- MongoDB + Mongoose  
- JWT Authentication  
- bcrypt  
- Cloudinary  

---


## 🔐 Security Highlights

- Password hashing with bcrypt  
- JWT token verification middleware  
- Role-based authorization guards  
- Ownership checks for seller resources  
- Protected API routes  
- Input validation  
- Secure Cloudinary uploads  

---

## ⚙️ Environment Variables

Create a `.env` file in server:
MONGO_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EMAIL_USER=
EMAIL_PASS=

---

## ▶️ Running Locally

### Backend
cd server
npm install
npm run dev

### Frontend
cd client
npm install
npm run dev


📌 Future Improvements

OTP authentication

Refresh tokens

Pagination & filtering

Advanced property search

Activity logs

Admin analytics dashboard

⭐ Why this project exists

This project was built to practice and demonstrate:

Real-world role-based systems

Secure full-stack authentication

Dashboard architecture

