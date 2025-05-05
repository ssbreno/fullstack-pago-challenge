FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

RUN npm install -D @storybook/cli

COPY . .

RUN npm run build

RUN npm run build-storybook

EXPOSE 3002
EXPOSE 6006

CMD ["npm", "run", "dev"]