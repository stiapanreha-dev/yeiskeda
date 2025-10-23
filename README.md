# Food Discount Platform

Marketplace for food products near expiry at minimum 30% discount.

## Live Site
- Production: https://xn----8sblcbwh9c.xn--p1ai/ (спаси-еду.рф)

## Quick Start

### Local Development
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

- Frontend: http://localhost:3012
- Backend: http://localhost:5000

### Docker Deployment
```bash
docker compose up -d --build
```

## Auto-Deployment

Every push to `master` branch automatically deploys to production via GitHub Actions.

See logs: https://github.com/stiapanreha-dev/yeiskeda/actions

## Tech Stack
- Backend: Node.js, Express, PostgreSQL, Sequelize
- Frontend: React, Vite, TailwindCSS, Leaflet
- Deployment: Docker, Docker Compose, GitHub Actions

