# The Angkor Times

[![Nuxt](https://img.shields.io/badge/Nuxt-4.0-00DC82?logo=nuxt.js)](https://nuxt.com/)
[![Directus](https://img.shields.io/badge/Directus-Latest-1E96FC?logo=data:image/svg%2Bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiI+PHBhdGggZD0iTTEyIDJMNiA3djZsNiA1IDYtNVY3bC02LTV6Ii8+PC9zdmc+)](https://directus.io/)
[![License](https://img.shields.io/github/license/SethyRung/The-Angkor-Times)](LICENSE)

_A modern news website powered by **Nuxt.js** (Frontend) and **Directus** (Headless CMS)._

---

## Features

- **News Publishing System** – Authors can publish news articles with rich content
- **Admin Approval Workflow** – All news requires admin approval before being published
- **Dynamic Navigation** – Website navigation managed via Directus CMS
- **Category-based Organization** – News grouped by categories with dedicated pages
- **Responsive Design** – Mobile-first layout using Tailwind CSS and Nuxt UI
- **Lazy Loading** – Efficient data fetching with skeleton states
- **Sanitized Content** – DOMPurify integration for secure HTML rendering

---

## Tech Stack

### Frontend
- [Nuxt 4](https://nuxt.com/) – Vue.js meta-framework
- [Nuxt UI](https://ui.nuxt.com/) – UI component library
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS
- [Vue 3](https://vuejs.org/) – Progressive JavaScript framework
- [Pinia](https://pinia.vuejs.org/) – State management
- [VueUse](https://vueuse.org/) – Composition utilities
- [dayjs](https://day.js.org/) – Date manipulation

### Backend
- [Directus](https://directus.io/) – Headless CMS
- [PostgreSQL](https://www.postgresql.org/) – Primary database
- [MinIO](https://min.io/) – S3-compatible object storage

### DevOps
- [Docker Compose](https://www.docker.com/) – Container orchestration
- Resource limits configured for all services

---

## Project Structure

```
The-Angkor-Times/
├── app/                    # Nuxt application
│   ├── components/         # Vue components (auto-imported)
│   │   ├── AppHeader.vue   # Site navigation header
│   │   ├── AppFooter.vue   # Site footer
│   │   └── news/           # News-related components
│   ├── pages/              # File-based routing
│   │   ├── index.vue       # Homepage
│   │   ├── search.vue      # Search page
│   │   └── [slug]/         # Dynamic category pages
│   ├── layouts/            # Layout wrappers
│   ├── plugins/            # Nuxt plugins
│   └── assets/             # CSS and static assets
├── shared/                 # Shared code
│   ├── types/              # TypeScript interfaces (Directus collections)
│   └── utils/              # Helper functions
├── public/                 # Static files
├── docker-compose.yml      # Backend services
├── nuxt.config.ts          # Nuxt configuration
└── .env.example            # Environment variables template
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- Docker (for backend services)

### 1. Clone & Install

```sh
git clone https://github.com/SethyRung/The-Angkor-Times.git
cd The-Angkor-Times
pnpm install
```

### 2. Start Backend Services

```sh
cp .env.example .env
docker-compose up -d
```

Wait for services to be healthy (~30 seconds).

### 3. Create MinIO Bucket

```sh
docker exec -it the_angkor_times_minio mc alias set local http://localhost:9000 admin supersecret
docker exec -it the_angkor_times_minio mc mb local/theangkortimes
```

### 4. Start Frontend

```sh
pnpm dev
```

Visit:
- **Frontend** → http://localhost:3000
- **Directus Admin** → http://localhost:8055
- **MinIO Console** → http://localhost:9090

---

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```ini
# Frontend
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NUXT_PUBLIC_SITE_NAME="The Angkor Times"
NUXT_PUBLIC_DIRECTUS_URL=http://localhost:8055

# PostgreSQL
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

# Directus Database
DB_CLIENT=pg
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=the_angkor_times
DB_USER=admin
DB_PASSWORD=supersecret

# Directus Storage (MinIO)
STORAGE_LOCATIONS=minio
STORAGE_MINIO_DRIVER=s3
STORAGE_MINIO_ENDPOINT=http://minio:9000
STORAGE_MINIO_KEY=admin
STORAGE_MINIO_SECRET=supersecret
STORAGE_MINIO_BUCKET=theangkortimes
STORAGE_MINIO_REGION=us-east-1
STORAGE_MINIO_FORCE_PATH_STYLE=true

# Directus Server
PUBLIC_URL=http://localhost:8055
CORS_ENABLED=true
CORS_ORIGIN=*
WEBSOCKETS_ENABLED=true
```

---

## Docker Commands

```sh
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart a specific service
docker-compose restart directus

# Check resource usage
docker stats
```

### Resource Limits

| Service | CPU Limit | Memory Limit |
|---------|-----------|--------------|
| postgres | 1 core | 512M |
| minio | 1 core | 512M |
| directus | 1 core | 1G |

---

## Directus Collections

<details>
<summary>Categories</summary>

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `name` | String | Category name |

</details>

<details>
<summary>Tags</summary>

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `name` | String | Tag name |

</details>

<details>
<summary>Navigation</summary>

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `label` | String | Menu label |
| `url` | String | Navigation path |
| `order` | Integer | Menu position |
| `category` | M2O | Linked category |

</details>

<details>
<summary>News</summary>

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `title` | String | Article title |
| `featured_image` | Image | Main image |
| `description` | Text | Short description |
| `content` | WYSIWYG | Full content |
| `author` | M2O | Author (directus_users) |
| `category` | M2O | Category |
| `tags` | M2M | Tags |
| `status` | Enum | Pending / Published / Rejected |
| `date_published` | DateTime | Publish date |
| `date_created` | DateTime | Created timestamp |
| `date_updated` | DateTime | Updated timestamp |

</details>

---

## Backup & Restore

### Database Backup

```sh
# Create backup
docker exec -t the_angkor_times_postgres pg_dump -U admin -d the_angkor_times -F c -f /tmp/the_angkor_times.dump

# Copy to host
docker cp the_angkor_times_postgres:/tmp/the_angkor_times.dump ./backup/
```

### Database Restore

```sh
# Stop Directus first
docker stop the_angkor_times_app

# Copy backup to container
docker cp ./backup/the_angkor_times.dump the_angkor_times_postgres:/tmp/the_angkor_times.dump

# Fresh restore (drop & recreate)
docker exec -it the_angkor_times_postgres bash -c "
  psql -U admin postgres -c \"DROP DATABASE IF EXISTS the_angkor_times\"
  psql -U admin postgres -c \"CREATE DATABASE the_angkor_times\"
  pg_restore -U admin -d the_angkor_times --no-owner --no-privileges --role=admin /tmp/the_angkor_times.dump
"

# Restart Directus
docker start the_angkor_times_app
```

### MinIO Files Backup

```sh
# Install mc client first, then:
mc alias set local http://localhost:9090 admin supersecret
mc mirror local/theangkortimes ./uploads_backup
```

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Author

Created by [**Sethy Rung**](https://github.com/SethyRung)

---

## Star the Repo

If you find this project helpful, please consider starring it to show your support!
