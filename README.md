# MeeChain Ops Dashboard

<img width="1536" height="1024" alt="1001395815" src="https://github.com/user-attachments/assets/53a8695b-fe7e-4f0d-851c-3ad7c1fb3061" />


MeeChain Ops Dashboard is a TypeScript monorepo for an operations dashboard and service tooling. The repository currently includes a React/Vite mockup preview shell, an Express API scaffold, OpenAPI-driven code generation, and a PostgreSQL/Drizzle database layer.


## Overview

This project is organized as a pnpm workspace with separate packages for:
- a mockup/frontend preview environment,
- an API server,
- an OpenAPI contract and generated client/schema code,
- a database package using Drizzle ORM.

The repository is intentionally structured as a reusable foundation for building a dashboard product and backend 
services around a shared contract-first API workflow.

<img width="1800" height="1180" alt="1001395814" src="https://github.com/user-attachments/assets/daf59916-90d9-429b-9d38-696bc44b5892" />


## Current status

The codebase is in an early scaffold stage:
- The frontend is a component preview sandbox for UI mockups.
- The API server currently exposes a health endpoint.
- The database package is prepared for Postgres work with Drizzle.
- API schemas and client code are generated from an OpenAPI spec.

## Tech stack

- Node.js 24
- TypeScript 5.x
- pnpm workspaces
- React 19
- Vite
- Express 5
- PostgreSQL
- Drizzle ORM
- Zod
- Orval (for API generation)
- esbuild

## Repository layout

```text
.
├── artifacts/
│   ├── api-server/          # Express API server
│   └── mockup-sandbox/      # React + Vite UI preview sandbox
├── lib/
│   ├── api-client-react/    # Generated React API client
│   ├── api-spec/            # OpenAPI contract and generation config
│   ├── api-zod/             # Generated Zod schemas
│   └── db/                  # Database package (Drizzle + Postgres)
├── scripts/                  # Workspace scripts
├── .replit                   # Replit project configuration
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
├── replit.md
└── README.md
```

# ตัวอย่าง UI
<img width="1280" height="800" alt="1001395819" src="https://github.com/user-attachments/assets/a0e5f0d7-b92a-403c-ac33-101a4851f49d" />

### MCB ###
```
## ขอบคุณทีม: MeeChain 
💌 mail: mcb@meechain.live
📡 app.meechain.live
```
