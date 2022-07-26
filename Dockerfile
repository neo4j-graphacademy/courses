FROM node:16-alpine
WORKDIR /app
COPY package*.json /app/
RUN NODE_ENV=production npm install
ENV NODE_ENV production
COPY . /app/
RUN npm run build

EXPOSE 3000
CMD ["node", "--max-http-header-size=24000", "/app/dist/main.js"]


