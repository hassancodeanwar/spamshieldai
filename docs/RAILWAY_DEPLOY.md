# Railway Deployment Guide

## Quick Deployment to Railway

SpamShieldAI is configured for easy deployment on Railway.

## Prerequisites

- Railway account (https://railway.app)
- GitHub repository connected to Railway
- `railway.json` configuration file

## Deployment Steps

### 1. Connect Your Repository

```bash
# Install Railway CLI (optional)
npm i -g @railway/cli

# Login to Railway
railway login

# Link your project
railway link
```

### 2. Set Environment Variables

In Railway Dashboard:

1. Go to your project
2. Click "Variables"
3. Add the following (if needed):

```
NODE_ENV=production
VITE_API_URL=https://your-api-url
PORT=3000
```

### 3. Deploy

Option A: Automatic (GitHub Integration)
- Push to main branch
- Railway automatically deploys

Option B: Manual
```bash
railway up
```

### 4. View Logs

```bash
railway logs
```

## Configuration

The `railway.json` file contains:
- Build command: `npm ci && npm run build`
- Start command: `caddy run --config /Caddyfile`
- Node version: 22.21.1
- Caddy version: 2.10.2

## Frontend Deployment

The frontend is deployed as a static Vite site:
- Output directory: `dist`
- Build: `npm run build`
- Server: Caddy

## Backend API

For API deployment, see [DEPLOY_QUICKSTART.md](./DEPLOY_QUICKSTART.md)

## Troubleshooting

### Issue: Node modules warning
**Warning:** `Node_modules directory found in project root`

**Solution:** This is expected. Railway will clean install dependencies:
```bash
npm ci  # Cleans install, respects package-lock.json
```

### Issue: Build failing
- Check that `npm run build` works locally
- Verify all dependencies in `package.json`
- Check `vite.config.ts` configuration

### Issue: API not connecting
- Set `VITE_API_URL` environment variable
- Ensure CORS is enabled on backend
- Check network connectivity

## Monitoring

In Railway Dashboard:
- View real-time logs
- Monitor CPU/Memory usage
- Check deployment history
- Rollback if needed

## Domain Setup

1. Go to "Domain" in Railway
2. Add custom domain (optional)
3. Configure DNS records

## Scaling

For increased traffic:
1. Upgrade plan in Railway Dashboard
2. Adjust allocated resources
3. Monitor performance

## References

- Railway Docs: https://docs.railway.app
- Deploy Guide: https://docs.railway.app/deploy/deployments
- Custom Domain: https://docs.railway.app/guides/public-networking

---

**Happy Deploying! 🚀**
