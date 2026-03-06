# French Business Map Explorer

An interactive web application for exploring and visualizing French businesses and establishments across the country. It uses the SIRENE database and provides a sleek, modern, map-centric interface to analyze business concentration geographically.

## Features

- **Interactive Map**: Built with React-Leaflet, allowing users to scroll, zoom, and explore data geographically.
- **Data Clustering & Heatmaps**: Visualize dense areas of businesses interactively.
- **NAF/CPF Classifications**: Browse and filter businesses using official NAF and CPF classifications.
- **Performant Backend**: Powered by Node.js, Express, and PostgreSQL/SQLite with optimized spatial and text queries to handle the ~10GB `StockEtablissement` CSV database.

## Screenshots

![Map View](docs/map-view.png)
_Interactive map view showing business clusters._

## The Stack

- **Frontend**: React (Vite), TailwindCSS, Leaflet / React-Leaflet, Zustand (state management), React-Query
- **Backend**: Node.js, Express, better-sqlite3 / PostgreSQL, Zod (validation)
- **Data Pipeline**: Tools provided in `src/scripts` to import, extract, and migrate large NAF and CSV datasets (`csv-parse`, `proj4`).

## Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL (if utilizing the PG pipeline) or SQLite for local dev
- The massive `StockEtablissement_utf8.csv` file from SIRENE (in the root directory)
- `.env` configured appropriately for both client and server

## Getting Started

### 1. Backend Setup

```bash
cd server
npm install
```

Configure your environment variables:
Create a `.env` file in the `server` directory.

```env
# Example .env configuration
PORT=5000
DATABASE_URL=postgres://user:password@localhost:5432/french_businesses
# Or whatever variables are required by the app
```

Run database migrations and data imports:

```bash
npm run db:migrate
npm run import:naf
npm run import:csv # Note: Parsing the 9.7GB CSV will take time!
```

Start the backend server:

```bash
npm run dev
```

### 2. Frontend Setup

In a new terminal:

```bash
cd client
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Visit the local URL provided by Vite (usually `http://localhost:5173`) to open the app.

## Project Structure

```text
french-company/
├── client/          # React frontend, Leaflet maps, TailwindCSS
├── server/          # Express backend API and database schemas
├── data/            # JSON nomenclature data (NAF, CPF)
├── .gitignore       # Git ignores including the huge 9.7GB .csv file
└── README.md
```

## License

MIT
