# About Routine Management System (RMS)
An automated solution for educational institutions designed to manage class schedules, routines, teacher's course assignments with availability time, and real-time mail notifications.
> **NOTE:** A high-performance collaborative internship project developed for **INFOGRAPHY TECHNOLOGIES**.

---

## Project Team
* **Full-Stack Developer:** Veerin Bajracharya [![Portfolio](https://img.shields.io/badge/Portfolio-000000?style=flat&logo=vercel&logoColor=white)](https://veerin-bajracharya.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-0D1117?style=flat&logo=github&logoColor=white)](https://github.com/vee309bajracharya)
  - Technical Lead, Front-end and Back-end Architect, API Design, DevOps, UX Designer
    
* **Front-end Developer:** Prajit Shrestha [![GitHub](https://img.shields.io/badge/GitHub-0D1117?style=flat&logo=github&logoColor=white)](https://github.com/prajit-shrestha)
  - State and Context Management, UI Logic and Implementation, Responsive Design.
    
* **UI/UX Designer:** Bishant Kayastha [![GitHub](https://img.shields.io/badge/GitHub-0D1117?style=flat&logo=github&logoColor=white)](https://github.com/Wachaa)
  - Visual Design and User Journey Mapping.

---

## Tech Stack

| Category | Technology |
| :--- | :--- |
| **UI Design & Wireframe** | ![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white) ![Excalidraw](https://img.shields.io/badge/Excalidraw-6965DB?style=for-the-badge&logo=excalidraw&logoColor=white) |
| **Front-end** | ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) |
| **Back-end** | ![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white) ![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white) ![Octane](https://img.shields.io/badge/Swoole-4BA52E?style=for-the-badge&logo=php&logoColor=white) |
| **Database** | ![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white) |
| **API Test** | ![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white) |
| **DevOps** | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) |

---

## Key Features

### Security & Access Control
* **RBAC (Role-Based Access Control):** Granular permissions for Admin, Teacher, and Student roles.
* **Secure Public Viewing:** Uses **Signed URLs** and **Hashids** to allow students to view routines without exposing IDs.
* **API Security:** Throttle middleware implemented on public routes to prevent bot attacks and brute-force attempts, User Role middleware implemented to access role-based APIs.
* **Auth:** Secure session/token management via Laravel Sanctum.

### Performance Optimization
* **Laravel Octane:** Powered by the Swoole server for ultra-low latency API responses.
* **Redis Caching:** Intelligent caching of user data and frequent routine queries to minimize database I/O.
* **Dockerized Environment:** Fully containerized backend, database, and caching layers for consistent deployment.

### Advanced Scheduling
* **Conflict-Aware CopyEntries:** A smart feature that allows copying schedules from one day to another with automatic conflict detection. Transactions are rolled back if a conflict is found to ensure data integrity.
* **PDF Generation:** Automated routine export functionality using `barryvdh/laravel-dompdf`.
* **Real-time Notifications:** Automated mail triggers to teachers upon routine published with routine web-view available in their accounts.

### Data Safety & Reliability
* **Routine Versioning & Snapshots:** Capability to save multiple "Routine Versions" of a schedule. Admins can load any saved snapshot at any time.
  
* **Time-Windowed Restore Routine Entry:** A "Safety Buffer" mechanism that allows admin to undo any accidental routine entry deletion within a 5-minute pop-up window

* **Hybrid Routine Entry Deletion Logic:** Implementation of Soft-Deletes for quick recovery, complemented by a "Clear All" function that confirms if admin saved current routine entries version before performing a permanent delete operation.

### Administrative Tools
* **Activity Logs:** Audit trails record of administrative actions powered by `spatie/laravel-activitylog`.
* **Responsive UI:** A seamless experience across mobile, tablet, and desktop devices.

---

## Project Structure

```text
routine-management-system/
├── back-end/          # Laravel
├── front-end/         # React.js (Vite) Application
├── docker/            # Custom Dockerfile and configurations
├── docker-compose.yml # Orchestration for Laravel, Redis, MySQL and phpMyAdmin
└── LICENSE.md         # Proprietary License
```

## Project License: **PROPRIETARY**
This software is a commercial product of **INFOGRAPHY TECHNOLOGIES**. The repository is maintained for version control and contribution tracking. 

> **Notice:** Access to the source code does not constitute a license for use. For commercial inquiries, please contact the **INFOGRAPHY TECHNOLOGIES** executive team.
