# 🥗 SimplePlate: Nourish Your Habits
**A Gamified Habit-Builder for Healthy Eating**

SimplePlate is a mobile-first web application designed to transform the tedious task of meal logging into a rewarding, RPG-like experience. Developed as a **Final Year Project (FYP)**, it focuses on user retention through "Poppy" UI animations, streak protection, and AI-driven nutritional feedback.

[![Deployed on Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://simple-plate.vercel.app)
![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Recharts]

---

## ✨ Key Features

### 🎮 Gamified Core
* **XP & Leveling System:** Earn XP for every meal logged. Watch your level grow from a "Seedling" to a "Master Chef."
* **Streak Tracking:** Stay consistent to build your "Day Streak." 
* **Streak Protection:** Purchase "Streak Pauses" from the Rewards shop to protect your progress on busy days.
* **Rewards Shop:** Spend earned points on exclusive UI badges and profile customizations.

### 🧠 Smart Logging & "Poppy" UI
* **AI Insights:** Powered by **Google Gemini Pro Vision** to provide instant feedback and "Nourish Scores" for meal logs.
* **Spring Physics:** High-stiffness, low-damping animations powered by **Framer Motion** for a tactile, responsive feel.
* **Activity Calendar:** A custom-built, interactive visual log of monthly nourishment activity.

### 🛠 Administrative Portal
* **User Management:** A secure admin dashboard to monitor community growth, edit user stats (Points/XP/Streaks), and manage roles.

### 📱 PWA (Progressive Web App)
* **Installable:** Fully configured `manifest.json` allowing users to "Add to Home Screen" for a full-screen, native app experience on iOS and Android.

---

## 🚀 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), Tailwind CSS |
| **Animations** | Framer Motion (Spring Physics) |
| **Backend** | Supabase (PostgreSQL, Auth, Edge Functions) |
| **AI Engine** | Google Gemini 1.5 Flash |
| **Deployment** | Vercel (CI/CD Pipeline) |

---

## 🏗 System Architecture & Automation

The project implements **Event-Driven Database Architecture** to ensure data integrity and a seamless onboarding experience.

### **Database Triggers**
Using **PostgreSQL Triggers** in the `auth` schema, the system automates user initialization:
1.  **Profiles:** Automatically creates a public profile upon sign-up.
2.  **User Stats:** Initializes Level 1, 10 XP, and 0 Points.
3.  **User Settings:** Generates default "Poppy" UI preferences.

### **Security & Privacy**
* **Salted Hashing:** User credentials are encrypted using Bcrypt within the secure `auth.users` table.
* **RLS (Row Level Security):** Strict PostgreSQL policies ensure users can only access their own dietary data.

---

## 📈 FYP Context
This project serves as a capstone for the **Computer Science / Software Engineering** degree program. It demonstrates:
* **Full-Stack Mastery:** Utilizing modern SSR (Server Side Rendering) frameworks.
* **Database Engineering:** Complex SQL triggers, Views, and Schema management.
* **UX/UI Excellence:** Implementing motion design as a functional feedback tool.
* **Cloud Infrastructure:** Continuous Deployment via Vercel and secure environment management.

---

## 👨‍💻 Author
**Ashton Chai** *Lead Developer & UI Designer*
