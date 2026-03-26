# Novaro HQ - Deployment Guide

## Quick Deploy to Vercel (Free)

### Step 1: Push to GitHub
```bash
cd novaro-hq
git init
git add .
git commit -m "Initial Novaro HQ dashboard"
git remote add origin https://github.com/YOUR_USERNAME/novaro-hq.git
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to https://vercel.com and sign in with GitHub
2. Click "New Project"
3. Import the `novaro-hq` repository
4. Add these environment variables:
   - `INSTANTLY_API_KEY` = your Instantly API key (Dashboard API tab)
   - `ANTHROPIC_API_KEY` = your Anthropic API key (for Elliott AI chat — claude-sonnet-4-6)
   - `NOTION_TOKEN` = your Notion integration token
   - `NOTION_LEAD_PIPELINE_DB` = f7380addb81244d784b566cdbbe49b90
   - `NOTION_OUTREACH_LOG_DB` = d233271c51b94a84a76af28120d1d0b2
   - `NOTION_CAMPAIGN_METRICS_DB` = c1597ce6c1b94f8e84784682d842b73b
   - `NOTION_ACTIVITY_FEED_DB` = ec81aa1688b84bdeaec4f574c438347b
5. Click "Deploy"

### Step 3: Connect Your Domain (GoDaddy)
1. In Vercel, go to Project Settings > Domains
2. Add `novarohq.com`
3. Vercel will give you DNS records (usually a CNAME)
4. In GoDaddy DNS settings, add those records
5. Wait 5-30 minutes for DNS propagation

### Getting Your Notion API Key
1. Go to https://www.notion.so/my-integrations
2. Click "New Integration"
3. Name it "Novaro HQ Dashboard"
4. Select your workspace
5. Copy the "Internal Integration Token"
6. Share each of the 4 databases with the integration (click "..." > "Connections" > add your integration)