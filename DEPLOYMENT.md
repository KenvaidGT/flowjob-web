# Deployment (Docker + CI/CD + Cloudflare Tunnel)

## Local production-like run (build inside Docker)

1. Copy `.env.example` to `.env` and set `VITE_DISCORD_CLIENT_ID` (+ optional vars)
2. Build & run:

```bash
docker compose up --build
```

Open: `http://localhost:8080`

Note: `VITE_*` variables are baked in at build time by Vite. If you change Discord config, rebuild the image.

## Server run (build on the server)

1. On the server, create a folder (for example `/opt/flowjob-web`) and copy in:
   - the repo (clone it), or at least: `Dockerfile`, `deploy/`, `docker-compose.prod.yml`
2. Create `/opt/flowjob-web/.env` with your build-time Vite vars:
   - `VITE_DISCORD_CLIENT_ID=...`
   - `VITE_DISCORD_REDIRECT_URI=...` (optional)
   - `VITE_DISCORD_SCOPES=identify email` (optional)
3. Build & start:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

The container listens on `127.0.0.1:8080` on the server (mapped to nginx `80` inside the container).

## Cloudflare Tunnel (host-managed) for `flowjob.id.lv`

If your server already runs `cloudflared` (recommended), point the tunnel ingress to the local web container.

Example `~/.cloudflared/config.yml` snippet:

```bash
ingress:
  - hostname: flowjob.id.lv
    service: http://127.0.0.1:8080
  - service: http_status:404
```

Notes:
- `docker-compose.prod.yml` binds to localhost only; the site is reachable publicly only via the tunnel/proxy you set up.
- If you need direct access by IP, change the compose port mapping to `"8080:80"`.

## GitHub Actions

- CI build: `.github/workflows/ci.yml`
- Optional SSH deploy: `.github/workflows/deploy.yml`
  - Required secrets:
    - `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_APP_DIR`
    - Optional: `DEPLOY_PORT`
  - The deploy script runs `git pull` (if the folder is a git repo) and then `docker compose ... up -d --build`.
