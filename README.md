# Queryable Intelligence Engine

**Queryable Intelligence Engine** is a robust Express backend API developed for Insighta Labs to provide highly structured, queryable data extraction from large demographic datasets. Built natively with PostgreSQL and Sequelize, it allows marketing teams, product teams, and growth analysts to safely slice data via structured constraints or natural language parsing.

---

## ⚡ Core Concept

The API is built securely around filtering `Profiles` encompassing attributes like gender probabilities, exact ages and bounds, locations via ISO standards, and unique UUID v7 identifiers.

Instead of writing SQL, clients make clean, safe REST requests using advanced strict constraint mappings perfectly wrapping arrays inside standardized structures mapping validation checks automatically.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- `npm` or `yarn`

### Installation
1. Clone the repository.
   ```bash
   git clone <repository>
   cd HNG_BE_2
   ```
2. Install dependencies.
   ```bash
   npm install
   ```
3. Set your environment variables safely.
   ```bash
   cat <<EOF > config.env
   PORT=3000
   SERVICE_URI=postgres://username:password@your-postgres-instance.com/defaultdb?sslmode=require
   EOF
   ```
4. Seed your database (assuming `profiles.json` securely exists in the root mapped).
   ```bash
   node seed.js
   ```
5. Run the Server.
   ```bash
   npm run dev
   ```

---

## 📖 API Documentation

### 1. Advanced Filtering API
**`GET /api/profiles`**

Extract exactly constrained datasets mapped gracefully using nested SQL constraints under-the-hood avoiding full-table scans via backend indices!

#### Supported Filters
| Parameter | Type | Description |
|-----------|------|-------------|
| `gender` | `Male` / `Female` | Exact string match. |
| `min_age` / `max_age` | `Integer` | Bounding constraints dynamically translating into `[Op.gte]` / `[Op.lte]`. |
| `age_group` | `String` | e.g. `child`, `teenager`, `adult`, `senior`. |
| `country_id`| `String` | Two-character ISO Code e.g. `NG`, `GB`. |
| `min_gender_probability` | `Float` | Finds records with gender probability confidence `>=` value. |
| `min_country_probability` | `Float` | Finds records with location probability confidence `>=` value. |

#### Pagination & Sorting Constraints
- `limit` - Size of array (Default: 10, Maximum: 50)
- `page` - Results offset (Default: 1)
- `sort_by` - Supports `age`, `created_at`, `gender_probability` (Default: `created_at`)
- `order` - Directions mapped `asc` or `desc` (Default: `asc`)

#### Example Use-case
Find top 10 females in Nigeria over age 20 sorted youngest to oldest:
```http
GET /api/profiles?gender=female&country_id=NG&min_age=20&sort_by=age&order=asc&limit=10
```

---

### 2. Natural Language Query Engine
**`GET /api/profiles/search`**

Instead of guessing query keys, query explicitly using simple Natural Language bounds via static dictionaries!

#### Rules
- **"young"** parses reliably into `min_age=16` & `max_age=24`.
- **"adult males from kenya"** parsed into `gender=male`, `age_group=adult`, `country_id=KE`.
- **"females above 30"** correctly structures `{age: {[Op.gte]: 30}}` efficiently natively.

#### Example Use-case
```http
GET /api/profiles/search?q=young males from nigeria
```

---

## 🔒 Error Catching and Validation Requirements

Requests throwing out-of-scale bounds securely map directly into JSON standardized payloads avoiding unhandled internal exceptions entirely!

* **`400 Bad Request`**: Unknown query constraints throw exactly:
  ```json
  { "status": "error", "message": "Invalid query parameters" }
  ```
* **`400 Bad Request`**: Sent keys holding empty string bounds throw exactly:
  ```json
  { "status": "error", "message": "Missing or empty parameter" }
  ```
* **`422 Unprocessable Entity`**: Passing string names mapping inside integer-required (`page`, `min_age`) query boundaries throws safely:
  ```json
  { "status": "error", "message": "Invalid parameter type" }
  ```
---

## 🛠 Tech Stack
- **Database Modeler**: [Sequelize Engine](https://sequelize.org)
- **Database Host Native**: [PostgreSQL (PG)](https://postgresql.org/)
- **Server Wrapper Engine**: [Express + Node.JS Platform](https://expressjs.com/)

---
*Built seamlessly powering dynamic metrics scaling accurately mapping Insighta Labs API requirements securely.*
