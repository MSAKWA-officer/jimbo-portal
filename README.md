# Mfumo wa Kusimamia Maombi ya Wananchi — AWAMU YA 1

Mfumo wa msingi (core) wenye tables 4: **Users, Constituents, RequestCategories, Requests**.

- **Backend:** Node.js + Express + Sequelize + PostgreSQL
- **Frontend:** Vite + React + Tailwind CSS

## Muundo wa Tables (Awamu ya 1)

| Table | Maelezo |
|---|---|
| `users` | Watumiaji wa mfumo (login): admin / staff / viewer |
| `constituents` | Wananchi wanaowasilisha maombi |
| `request_categories` | Aina za maombi (Elimu, Afya, n.k.) |
| `requests` | Ombi lenyewe — limeunganishwa na constituent, category, na user aliyeliandikisha |

Tables zinatengenezwa moja kwa moja unapowasha server, kupitia:

```js
await sequelize.sync({ alter: true });
```

(Angalia `backend/models/index.js`)

## Jinsi ya Kuendesha

### 1. Database
Tengeneza database ya PostgreSQL:

```bash
createdb mfumo_maombi
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# hariri .env kama inahitajika (DB_USER, DB_PASSWORD, JWT_SECRET, n.k.)
npm install
npm run dev        # au: npm start
```

Server itaanza kwenye `http://localhost:5000` na moja kwa moja itatengeneza tables zote 4 kwenye database.

Kwanza jisajili mtumiaji (admin) kupitia:
```
POST http://localhost:5000/api/auth/register
Body: { "fullName": "Admin", "email": "admin@mfumo.co.tz", "password": "siri123", "role": "admin" }
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Fungua `http://localhost:5173` — jisajili au ingia, kisha:
1. Ongeza **Kategoria** (Elimu, Afya, Miundombinu...)
2. Ongeza **Wananchi**
3. Wasilisha **Maombi** na fuatilia hali yake (Inasubiri → Inapitiwa → Imekubaliwa/Imekataliwa → Imekamilika)

## API Endpoints Muhimu

| Method | Endpoint | Maelezo |
|---|---|---|
| POST | `/api/auth/register` | Sajili mtumiaji |
| POST | `/api/auth/login` | Ingia |
| GET | `/api/constituents` | Orodha ya wananchi (?search=) |
| POST | `/api/constituents` | Ongeza mwananchi |
| GET | `/api/categories` | Orodha ya kategoria |
| POST | `/api/categories` | Ongeza kategoria |
| GET | `/api/requests` | Orodha ya maombi (?status=&categoryId=) |
| POST | `/api/requests` | Wasilisha ombi jipya |
| PATCH | `/api/requests/:id/status` | Badilisha hali ya ombi |
| GET | `/api/requests/stats/summary` | Takwimu za dashibodi |

## Awamu Zijazo (mapendekezo)
- `REQUEST_EVENTS` — historia/matukio ya kila ombi (timeline)
- `EXPENDITURES` — matumizi ya fedha yanayohusiana na ombi
- `REPORTS` — ripoti za muhtasari
- `ATTACHMENTS` — hati/picha zilizoambatanishwa kwenye ombi
