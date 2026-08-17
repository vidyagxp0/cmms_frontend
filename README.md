# Calibration

Production-oriented React + Vite starter for Calibration Management Software.

## Stack

- React + JSX
- Vite
- Tailwind CSS
- React Router
- Axios
- TanStack Query
- Zustand
- React Hook Form + Zod
- Lucide React
- clsx + tailwind-merge

## Setup

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Architecture

```text
src/
├── app/
│   └── providers/
├── assets/
├── components/
│   ├── common/
│   ├── layout/
│   └── ui/
├── config/
├── constants/
├── context/
├── hooks/
├── pages/
├── routes/
├── services/
├── store/
├── utils/
├── App.jsx
├── index.css
└── main.jsx
```

## Rules

- `pages/` = route-level screens.
- `components/` = reusable UI.
- `routes/` = URL-to-page mapping.
- `services/` = API communication.
- `hooks/` = reusable React logic.
- `store/` = small global client state.
- TanStack Query = server/API state.
- `utils/` = pure helper functions.
- `config/` = application/environment configuration.
