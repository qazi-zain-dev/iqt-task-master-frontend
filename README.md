# TodoList Frontend (TaskMaster Pro)

A modern, responsive, high-performance task management frontend built with React.js, Tailwind CSS, Lucide Icons, and Vite.

## Features

- **Full CRUD Capabilities:**
  - Create tasks with title, description, priority, category, due date, and tags
  - Edit tasks with validation
  - Delete tasks with safe confirmation modal dialogs
  - Interactive completion toggle with instant progress tracking
- **Dynamic KPI Dashboard:** Overview cards for Total, In Progress, Completed (with % progress bar), and Urgent/High priority items
- **Advanced Filtering & Sorting:** Real-time search, status tabs, priority filters, category dropdown, multi-attribute sorting, and Grid/List view toggle
- **External Public API Integrations:**
  - Live Weather & Task Strategy widget powered by Open-Meteo
  - Public GitHub repository open issues sync modal

## Tech Stack

- React 19
- Vite
- Tailwind CSS v4
- Lucide React
- Axios

## Setup & Running

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend runs by default on `http://localhost:3000` and proxies `/api/*` requests to the backend server at `http://localhost:5000`.
