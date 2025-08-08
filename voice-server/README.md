# RealTalk Voice Server

Socket.IO signaling server for WebRTC voice chat.

## Deploy to Render

1. Create new GitHub repository with these files
2. Connect to Render as Web Service
3. Use these settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node

## Environment Variables

None required - CORS is configured for Vercel domains.

## Health Check

Visit `/health` to check server status.

