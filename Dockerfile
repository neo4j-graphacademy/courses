# Dockerfile
FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm install --include=dev

COPY . .

CMD [ "npm", "run", "dev:watch"]
