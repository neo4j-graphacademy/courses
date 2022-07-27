FROM node:16-alpine
WORKDIR /app

RUN apk add jq curl

COPY . /app/

RUN NODE_ENV=production npm install
ENV NODE_ENV production

RUN chmod +x /app/sync
RUN /app/sync

RUN npm run build

EXPOSE 3000
CMD ["node", "--max-http-header-size=24000", "/app/dist/main.js"]
