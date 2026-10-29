FROM node:22-bookworm AS development

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

FROM development AS test

CMD ["npm", "test"]

FROM node:22-bookworm-slim AS production

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --chown=node:node src ./src

EXPOSE 3000

USER node

CMD ["npm", "start"]
