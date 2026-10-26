# Project Station

Project Station is a browser based project and operations management application for Whiteboard Technologies (WBT). It provides a React web client and Progressive Web App (PWA) for the Project Station system. The client communicates with separately hosted HTTP API and Socket.IO services; this repository contains the frontend, not the backend.

## What the application covers

The app brings together project dashboards and documents, design coordination, work breakdown structures and milestones, tasks, RFQs, submittals, RFIs, change orders, estimates, invoices, vendors and fabricators, team and employee tools, reports, and real-time chat and notifications. Available screens and actions depend on the signed-in user's role and backend permissions.

## Requirements

- Node.js 20.19+ or 22.12+ and npm (the versions supported by the Vite 7 release used here).
- A network connection to a compatible Project Station backend, including its HTTP API and Socket.IO service.
- A Project Station account to sign in. Authentication, application data, file storage, and authorization are handled by the backend; this repository does not include a local/demo backend.
- A modern browser. HTTPS is required for production service worker/PWA installation and browser features such as notifications (localhost is treated as a secure origin for development).

## Configure before running

Create a `.env` file in the repository root. `.env` is ignored by Git. Set the URLs for the backend environment you intend to use:

```dotenv
# HTTP API base URL. Include a path prefix if the API is mounted below the host root.
VITE_BASE_URL=https://your-project-station-host.example/api

# Socket.IO service origin. If omitted, it defaults to http://localhost:5156.
VITE_SOCKET_URL=https://your-project-station-host.example
```

`VITE_BASE_URL` is required for normal API requests. The app appends endpoint paths such as `auth/login` to this base URL. Include the API's path prefix when it is not hosted at the root. `VITE_SOCKET_URL` controls the Socket.IO connection and can be a different origin from the HTTP API. If omitted, local socket connections target `http://localhost:5156`.

Before using the app, make sure the configured services are reachable from the browser and that the backend allows the frontend origin through its CORS policy for HTTP and Socket.IO/WebSocket connections. The socket connection sends the signed-in user's JWT as Socket.IO authentication (`auth.token`); HTTP requests send it as a Bearer token.

Vite embeds `VITE_*` values in the built client assets. Treat them as public configuration: do not put passwords, private API keys, signing secrets, or other sensitive credentials in these variables. Use HTTPS endpoints for deployed environments.

## Install and run

```bash
npm install
npm run dev
```

Vite prints the local development URL, usually `http://localhost:5173`. Sign in with an account provisioned on the configured backend. Restart the dev server after changing `.env` values.

To compile and type-check the frontend:

```bash
npm run build
```

To serve the compiled `dist/` output locally:

```bash
npm run preview
```

## Build and deployment

The build output is written to `dist/`. Set the production `VITE_BASE_URL` and, when needed, `VITE_SOCKET_URL` in the build environment before running `npm run build`; these values are embedded at build time.

Deploy the contents of `dist/` to a static web host. Configure the host to return `index.html` for client-side application routes so direct visits and page refreshes continue to work. The PWA service worker is generated for production builds and is disabled in Vite's development server configuration. Serve the deployed app over HTTPS for service worker and installation support.

## Project layout

```text
src/
  api/          Axios client and backend service methods
  components/   Shared UI and feature components
  constants/    Shared constants and navigation definitions
  context/      React context providers, including theme
  hooks/        Reusable hooks, API caching, and notifications
  interface/    TypeScript models and payload types
  layout/       Route-level page layouts
  middleware/   Authentication and socket helpers
  pages/        Top-level feature pages
  routes/       React Router route tree
  store/        Redux store and feature slices
  utils/        Date, file, formatting, and other helpers
public/         Static files served from the site root
vite.config.ts  Vite, PWA, Tailwind, and import alias configuration
```

The app entry point is `src/main.tsx`; it sets up React Router, Redux, and the theme provider. Routes are defined in `src/routes/routes.ts`, with the dashboard area guarded by `src/middleware/RequireAuth.tsx`. `src/api/api.ts` configures Axios and adds the current Bearer token, while `src/api/Service.ts` contains most domain API methods. `src/socket.ts` configures Socket.IO. Shared application state is organized into Redux slices under `src/store/`.

## Common scripts

| Command | Purpose |
| --- | --- |
| `npm install` | Install project dependencies |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build the production frontend into `dist/` |
| `npm run preview` | Preview the production build locally |

These are the scripts currently defined in `package.json`. There are no lint or test scripts in this repository at present.

## Troubleshooting

- **API calls fail or login cannot complete:** check `VITE_BASE_URL`, including any API path prefix, backend availability, and whether the account is enabled. Restart Vite after changing `.env`.
- **Browser reports CORS errors:** allow the local frontend origin (usually `http://localhost:5173`) in the backend's HTTP and Socket.IO CORS configuration.
- **Chat or notifications do not connect:** check `VITE_SOCKET_URL`, network access to the Socket.IO service, and the browser console for connection errors. A signed-in session is required for authenticated socket connections.
- **A dashboard route redirects to login:** check the backend's login and current-user responses and confirm the account has an expected role and permissions.
- **Refreshing a nested route returns 404 after deployment:** configure the static host to fall back to `index.html` for client-side routes.
- **An installed app shows old assets:** publish the new build and reload/update the app so its service worker can use the latest assets.

## Development notes

- Use the `@/` import alias for modules under `src/`; it is configured in `vite.config.ts`.
- Keep backend URLs and credentials out of committed source. Values prefixed with `VITE_` are visible in client bundles and are not a safe place for secrets.
- Authentication tokens are stored in `sessionStorage`. A `401` API response clears the session and redirects to login.
- Browser notification permission is optional for basic use. Allow it in the browser to receive system notifications.
- Coordinate API contract changes with the backend project; no backend service or database setup is included here.
