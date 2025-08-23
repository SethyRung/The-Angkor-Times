# 📰 The Angkor Times

_A modern news website powered by **Nuxt.js** (Frontend) and **Directus** (Headless CMS)._

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

### **Backend (Directus + PostgreSQL + MinIO)**

- [Directus](https://directus.io/) – Open-source headless CMS
- PostgreSQL – Primary database
- MinIO – S3-compatible storage for file uploads

---

## 📂 Directus Collections

(Click to expand)

<details>
<summary>Categories</summary>

| Field Name | Type   | Description                         |
| ---------- | ------ | ----------------------------------- |
| `id`       | UUID   | Unique identifier for each category |
| `name`     | String | Name of the category                |

</details>

<details>
<summary>Tags</summary>

| Field Name | Type   | Description                    |
| ---------- | ------ | ------------------------------ |
| `id`       | UUID   | Unique identifier for each tag |
| `name`     | String | Name of the tag                |

</details>

<details>
<summary>Navigation</summary>

| Field Name | Type             | Description                           |
| ---------- | ---------------- | ------------------------------------- |
| `id`       | UUID             | Unique identifier for each navigation |
| `label`    | String           | Display name of the menu item         |
| `url`      | String (unique)  | Path to navigate                      |
| `order`    | Integer          | Position in the menu                  |
| `category` | M2O (categories) | Category of navigation                |

</details>

<details>
<summary>News</summary>

| Field Name       | Type                 | Description                           |
| ---------------- | -------------------- | ------------------------------------- |
| `id`             | UUID                 | Unique identifier for each news post  |
| `title`          | String               | Title of the news article             |
| `featured_image` | Image                | Main image of the article             |
| `description`    | Text                 | Short description                     |
| `content`        | Text (WYSIWYG)       | Full content                          |
| `author`         | M2O (directus_users) | Author of the post                    |
| `category`       | M2O (categories)     | Category                              |
| `tags`           | M2M (tags)           | Tags                                  |
| `status`         | Enum                 | Pending Approval, Published, Rejected |
| `date_published` | DateTime             | Publish date                          |
| `date_created`   | DateTime             | Auto-set when created                 |
| `date_updated`   | DateTime             | Auto-updated on edit                  |

</details>

---

## 🛋️ Installation (Frontend - Nuxt)

### 1️⃣ Clone the Repository

```sh
git clone https://github.com/SethyRung/The-Angkor-Times.git
cd The-Angkor-Times
```

### 2️⃣ Install Dependencies

```sh
npm install
```

### 3️⃣ Setup Environment Variables

Copy `.env.example` → `.env`:

```sh
cp .env.example .env
```

Edit `.env` with your **Directus API URL**.

### 4️⃣ Start Nuxt Development Server

```sh
npm run dev
```

Frontend runs on `http://localhost:3000`.

---

## ⚙️ Setup Directus + Database + MinIO Locally

### 1️⃣ Setup Environment

Copy `.env.example` → `.env`:

```sh
cp .env.example .env
```

Edit `.env` as needed. Example:

```ini
# Postgres
POSTGRES_USER=admin
POSTGRES_PASSWORD=supersecret
POSTGRES_DB=the_angkor_times

# MinIO
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=supersecret

# Directus
KEY=your-random-key
SECRET=your-random-secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=supersecret

DB_CLIENT=pg
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=the_angkor_times
DB_USER=admin
DB_PASSWORD=supersecret

STORAGE_LOCATIONS=minio
STORAGE_MINIO_DRIVER=s3
STORAGE_MINIO_KEY=admin
STORAGE_MINIO_SECRET=supersecret
STORAGE_MINIO_BUCKET=theangkortimes
STORAGE_MINIO_REGION=us-east-1
STORAGE_MINIO_ENDPOINT=http://minio:9000
STORAGE_MINIO_FORCE_PATH_STYLE=true

PUBLIC_URL=http://localhost:8055
CORS_ENABLED=true
CORS_ORIGIN=*
WEBSOCKETS_ENABLED=true
```

### 2️⃣ Start Services

```sh
docker-compose up -d
```

Services:

- **Directus** → `http://localhost:8055`
- **Postgres** → `localhost:5432`
- **MinIO Console** → `http://localhost:9090` (login: `admin/supersecret`)

### 3️⃣ Create MinIO Bucket

```sh
docker exec -it the_angkor_times_minio mc alias set local http://localhost:9000 admin supersecret
docker exec -it the_angkor_times_minio mc mb local/theangkortimes
```

### 4️⃣ Restore Database (Optional)

Got it ✅

Here’s a revised **Restore Database** step that matches your setup (with the provided `backup/the_angkor_times.dump` and the need to stop Directus first if dropping the DB):

---

### 🔄 Restore Database

You can restore the database from the provided backup file: `backup/the_angkor_times.dump`.

```sh
# Stop Directus (to avoid schema conflicts during restore):
docker stop the_angkor_times_app

# Copy the backup file into container
docker cp backup/the_angkor_times.dump the_angkor_times_postgres:/the_angkor_times.dump

# Option A: Fresh Restore (drop & recreate database)
# Use this if you want a completely clean restore.
docker exec -it the_angkor_times_postgres bash
psql -U admin postgres -c "DROP DATABASE the_angkor_times"
psql -U admin postgres -c "CREATE DATABASE the_angkor_times"
pg_restore -U admin -d the_angkor_times --no-owner --no-privileges --role=admin /the_angkor_times.dump

# Option B: Restore into existing database (no drop needed)
# Use this if the database already exists and you just want to restore data.
docker exec -it the_angkor_times_postgres pg_restore -U admin -d the_angkor_times --clean --no-owner --no-privileges --role=admin /backup/the_angkor_times.dump

# Restart Directus*
docker start the_angkor_times_app
```

---

## 💾 Backup & Restore

### Backup Database

```sh
docker exec -t the_angkor_times_postgres pg_dump -U admin -d the_angkor_times -F c -f the_angkor_times.dump

docker cp the_angkor_times_postgres:/the_angkor_times.dump .
```

### Backup Files (from MinIO)

```sh
mc alias set local http://localhost:9090 admin supersecret
mc mirror local/theangkortimes ./uploads_backup
```

### Restore Files

```sh
mc mirror ./uploads_backup local/theangkortimes
```

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes
4. Push to your fork and submit a PR

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👤 Author

Created by [**Sethy Rung**](https://github.com/SethyRung)
📫 Reach out via GitHub if you'd like to collaborate!

---

## 🌟 Star the Repo

If you find this project helpful, please consider starring ⭐ it to show your support!
