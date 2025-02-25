# 📰 The Angkor Times

_A modern news website powered by \***\*Nuxt.js\*\*** (Frontend) and \***\*Directus\*\*** (Headless CMS)._

---

## 🚀 Features

- **News Publishing System** – Authors can publish news articles.
- **Admin Approval** – All news requires admin approval before being published.
- **Dynamic Navigation** – The website navigation is managed via Directus.
- **Pagination** – Efficient data fetching with Nuxt's SSR.

---

## 🛠️ Tech Stack

### **Frontend (Nuxt.js)**

- [Nuxt 3](https://nuxt.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Nuxt UI](https://ui.nuxt.com/)
- [Nuxt Directus Module](https://nuxt.com/modules/directus)
- Vue 3 Composition API

### **Backend (Directus)**

- [Directus](https://directus.io/) – Open-source headless CMS
- PostgreSQL (Database)

---

## 🛋️ Installation

### **1️⃣ Clone the Repository**

```sh
git clone https://github.com/SethyRung/The-Angkor-Times.git
cd The-Angkor-Times
```

### **2️⃣ Install Dependencies**

```sh
# Install dependencies for Nuxt frontend
npm install
```

### **3️⃣ Setup Environment Variables**

Copy `.env.example-nuxt` and create a `.env` file:

```sh
cp .env.example .env
```

Edit `.env` with your **Directus API URL** and other settings.

---

## 🚀 Hosting Directus on Render

1. Create an account on [Render](https://render.com/).
2. Click **New Web Service** and connect your GitHub repository.
3. Select the **Directus** repository and choose a region.
4. Select the **Docker** for Language.
5. Set up the environment variables from your `.env.example-directus` file in Render’s settings.
6. Deploy the service, and once completed, Directus will be accessible at your assigned Render URL.

---

## 🚀 Running the Project

### **1️⃣ Start Nuxt Development Server**

```sh
npm run dev
```

By default, the frontend runs on `http://localhost:3000`.

🚀 **Happy Coding!** 🚀
