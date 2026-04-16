# Deployment (Docker + CI/CD + Cloudflare Tunnel)

## Local production-like run (build inside Docker)

1. Copy `.env.example` to `.env` and set `VITE_DISCORD_CLIENT_ID` (+ optional vars)
2. Build & run:

```bash
docker compose up --build
```

Open: `http://localhost:8080`

Note: `VITE_*` variables are baked in at build time by Vite. If you change Discord config, rebuild the image.

## Server run (pull image from GHCR)

1. On the server, create a folder (for example `/opt/flowjob-web`) and copy in:
   - `docker-compose.prod.yml`
2. Create `/opt/flowjob-web/.env` with:
   - `FLOWJOB_WEB_IMAGE=ghcr.io/<owner>/<repo>:latest`
3. Start:

```bash
docker compose -f docker-compose.prod.yml up -d
```

The container listens on port `8080` on the server (mapped to nginx `80` inside the container).

## Server run (Cloudflare Tunnel for `flowjob.id.lv`)

If your server already has a Cloudflare Tunnel for `flowjob.id.lv`, you can run `cloudflared` as a sidecar container.

1. In the same app dir (example `/opt/flowjob-web`), copy:
   - `docker-compose.tunnel.prod.yml`
   - `deploy/cloudflared/config.yml.example` → `deploy/cloudflared/config.yml`
2. Put your tunnel credentials file at:
   - `/opt/flowjob-web/deploy/cloudflared/credentials.json`
   - (usually you get it from the server at `~/.cloudflared/<tunnel-id>.json` and copy/rename it)
3. Edit `/opt/flowjob-web/deploy/cloudflared/config.yml`:
   - set `tunnel:` to your tunnel name/UUID
   - keep `hostname: flowjob.id.lv`
4. Start:

```bash
docker compose -f docker-compose.tunnel.prod.yml up -d
```

Notes:
- This setup does not publish ports publicly; traffic goes Cloudflare → `cloudflared` → `web:80` over the Docker network.
- If you also need local access on the server, you can add ports back to `web` in `docker-compose.tunnel.prod.yml`.

## GitHub Actions

- CI build: `.github/workflows/ci.yml`
- Build & push to GHCR: `.github/workflows/docker.yml`
  - Set repository secrets if you want the published image to include Discord config:
    - `VITE_DISCORD_CLIENT_ID`
    - `VITE_DISCORD_REDIRECT_URI`
    - `VITE_DISCORD_SCOPES`
- Optional SSH deploy: `.github/workflows/deploy.yml`
  - Required secrets:
    - `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_APP_DIR`
    - Optional: `DEPLOY_PORT`

