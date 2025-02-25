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

### 📂 Directus Collections

- `categories`

| Field Name        | Type       | Description                              |
|-------------------|------------|------------------------------------------|
| `id`              | UUID       | Unique identifier for each category      |
| `name`            | String     | Name of the category                     |

- `tags`

| Field Name        | Type       | Description                              |
|-------------------|------------|------------------------------------------|
| `id`              | UUID       | Unique identifier for each tag           |
| `name`            | String     | Name of the tag                          |

- `navigation`

| Field Name        | Type       | Description                              |
|-------------------|------------|------------------------------------------|
| `id`              | UUID       | Unique identifier for each navigation    |
| `label`           | String     | Display name of the menu item            |
| `url`             | String (unique) | Path to navigate                    |
| `order`           | Integer    | Position in the menu                     |
| `category`        | M2O (categories) | Category of navigation             |

- `news`

| Field Name        | Type       | Description                              |
|-------------------|------------|------------------------------------------|
| `id`              | UUID       | Unique identifier for each news post     |
| `title`           | String     | Title of the news article post           |
| `featured_image`  | Image      | Main image of the article                |
| `description`     | Text       | Description of the news article post     |
| `content`         | Text (WYSIWYG)| Full content of the news              |
| `author`          | M2O (directus_users)| The author who created the news |
| `category`        | M2O (categories)| Category of the news                |
| `tags`            | M2M (tags) | Tags for filtering/searching             |
| `status`          | Enum       | Pending Approval, Published, Rejected    |
| `date_published`  | DateTime       | Date when news is published          |
| `date_created`    | DateTime       | Automatically set when created       |
| `date_updated`    | DateTime       | Automatically updated on edit        |

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
cp .env.example-nuxt .env
```

Edit `.env` with your **Directus API URL** and other settings.

### **4️⃣ Start Nuxt Development Server**

```sh
npm run dev
```

By default, the frontend runs on `http://localhost:3000`.

---

## Setup Directus Locally
Copy `.env.example-directus` and create a `.env` file:
```sh
cp .env.example-directus .env
```

Build the Docker Image
```sh
docker build -t the-angkor-times-backend .
```

Run the Container with the `.env` File
```sh
docker run --env-file .env -p 8055:8055 the-angkor-times-backend
```


## 🚀 Hosting Directus on Render

1. Create an account on [Render](https://render.com/).
2. Click **New Web Service** and connect your GitHub repository.
3. Select the **Directus** repository and choose a region.
4. Select the **Docker** for Language.
5. Set up the environment variables from your `.env.example-directus` file in Render’s settings.
6. Deploy the service, and once completed, Directus will be accessible at your assigned Render URL.

👩‍💻 **Happy Coding!** 🎉
