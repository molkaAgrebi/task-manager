# ---- API image (Node.js + Express) ----
# "slim" = small Debian image; bcrypt's prebuilt binary works on it out of the box.
FROM node:22-slim

# Production mode: Express is faster and hides error details
ENV NODE_ENV=production
WORKDIR /app

# 1. Install dependencies first (this layer is cached while package*.json don't change)
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# 2. Copy the source code (.dockerignore keeps .env, tests and node_modules out)
COPY . .

# Do not run as root inside the container
USER node

EXPOSE 5000

# Docker checks the API (and its database) every 30 s
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:5000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Create/update the tables, then start the server
CMD ["sh", "-c", "node db/migrate.js && node index.js"]
