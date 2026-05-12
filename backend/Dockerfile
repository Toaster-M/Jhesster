FROM node:22-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./

RUN npm run build

RUN npm prune --omit=dev

EXPOSE 3001
CMD ["npm", "start"]
