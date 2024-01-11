# Dockerfile
FROM node:16
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

WORKDIR /app

COPY package*.json ./

RUN npm install --include=dev

COPY . .

CMD [ "npm", "run", "dev:watch"]
