# The Playwright image includes the browser dependencies required to record and run jobs.
# Keep its version aligned with the Playwright package in package.json.
FROM mcr.microsoft.com/playwright:v1.55.0-jammy

USER root
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . ./
RUN npm run build \
  && mkdir -p /app/data /app/automations /app/output \
  && chown -R pwuser:pwuser /app

ENV NODE_ENV=production \
    PORT=3001

USER pwuser
EXPOSE 3001
CMD ["node", "server/index.js"]
