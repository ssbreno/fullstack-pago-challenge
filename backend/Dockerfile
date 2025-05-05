FROM node:22-alpine AS development

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev --ignore-scripts --legacy-peer-deps

COPY . .

EXPOSE 8080

CMD ["npm", "run", "start:dev"]

FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

FROM node:22-alpine AS production

WORKDIR /app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

COPY package*.json ./

RUN npm config set strict-ssl false

RUN npm install --omit=dev --ignore-scripts --legacy-peer-deps

COPY --from=build /app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/main"]