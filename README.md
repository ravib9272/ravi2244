# Cloud Chat System

A responsive real-time chat application built with React, Tailwind CSS, Express, Socket.IO, MongoDB, JWT and optional AWS S3 file storage.

## Requirements
- Node.js 20+
- MongoDB Atlas database (or local MongoDB)
- npm

## Project structure
```text
cloud-chat-system/
  client/                 React + Vite + Tailwind frontend
  server/                 Express + Socket.IO API
  README.md
```

## 1. Configure environment
Copy `server/.env.example` to `server/.env` and set:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: long random secret (32+ characters)
- `CLIENT_URL`: frontend origin, e.g. `http://localhost:5173`
- `PORT`: API port (default 5000)

For optional S3 file uploads, set `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_S3_BUCKET`. Without these values, cloud uploads are disabled and the UI displays a configuration message.

## 2. Install and run
Terminal 1:
```bash
cd server
npm install
npm run dev
```
Terminal 2:
```bash
cd client
npm install
npm run dev
```
Open http://localhost:5173. Register two accounts in separate browser sessions to test messaging.

## Included features
- Landing page with project overview and architecture
- Register/login with validation, bcrypt password hashing and JWT
- Authenticated dashboard, online presence and recent conversations
- Real-time group and private messaging with Socket.IO (start a direct conversation from People)
- Persisted message history in MongoDB
- Emoji picker (native emoji input), timestamps and file attachments
- Admin endpoints and UI for listing users, warnings and room kicks
- Responsive layout and dark mode toggle
- Optional S3 uploads using presigned URLs

## API overview
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/users`, `GET /api/users/online`, `POST /api/admin/warn/:userId`
- `GET /api/rooms`, `POST /api/rooms`, `POST /api/rooms/:roomId/kick`
- `GET /api/messages/:roomId`
- `POST /api/uploads/presign` (S3 configuration required)

Socket events (authenticated connection):
- Client -> `room:join`, `message:send`, `typing:start`, `typing:stop`
- Server -> `presence:update`, `message:new`, `room:error`, `typing:update`

## First admin
Register normally, then promote that account directly in MongoDB:
```javascript
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```
Never expose database credentials in frontend code.

## Production deployment
1. Provision MongoDB Atlas and restrict network access to your server.
2. Deploy the `server` folder to Render, Railway, Fly.io, AWS, Azure or Google Cloud. Configure all environment variables and persistent storage if using local uploads.
3. For production file storage, configure a private S3 bucket and use the presigned upload flow. Configure bucket CORS for your frontend origin and PUT requests.
4. Deploy `client` to Vercel, Netlify, Cloudflare Pages or a static hosting bucket. Set `VITE_API_URL` and `VITE_SOCKET_URL` to the deployed API origin.
5. Set `CLIENT_URL` on the API to the exact frontend origin. Enable HTTPS/WSS.
6. Promote an administrator using the MongoDB command above.
7. Use a strong unique JWT secret, rotate credentials, configure backups in Atlas, and review provider logs.

## Security notes
This is a functional starter project, not a security audit. Before production, add rate limiting, email verification, password reset, malware scanning for uploads, retention policies, audit logging, monitoring, and stricter moderation workflows. Use HTTPS, private S3 objects, least-privilege IAM and a managed database backup policy.
