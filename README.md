# 📚 Advanced Library Management System (NestJS + MongoDB)

A backend REST API project built with NestJS and MongoDB to manage a modern digital library. It includes CMS and Web APIs for handling books, members, authors, and branches, along with real-time features and advanced borrowing logic.

---

## 🧾 Features

### ✅ Core Functionality

- Member registration and login with email OTP
- Author management with email-based pin codes
- Add/update/delete books with metadata and file uploads
- Book borrowing and return tracking with age and return rate restrictions
- Real-time branch inventory management
- Book reviews and popularity-based sorting
- Return rate auto-update via daily scheduled jobs
- Role-based CMS with Admin and Intern permissions

### 📊 CMS Dashboard

- View total/overdue books
- Top books and authors
- Branch-wise analytics
- Role-based book distribution and request approvals

---

## 📂 API Categories

- **Books:** CRUD, filter, sort, publish/unpublish, borrow, return
- **Authors:** CRUD, add by CMS, login with pin
- **Members:** Sign up, login, profile, subscribe, borrow history, reviews
- **Branches:** Create/distribute books, inventory control
- **CMS:** Admin & Intern roles, dashboards, user management

---

## ⚙️ Tech Stack

- **Backend Framework:** NestJS
- **Database:** MongoDB
- **Validation:** Joi
- **Testing:** Jest 
- **Documentation:** Postman
- **Design Pattern:** MVC, Modular Structure

---



