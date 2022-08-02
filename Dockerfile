FROM node:16-alpine
WORKDIR /app

RUN apk add jq curl

ENV NODE_ENV production
ARG GITHUB_OAUTH_TOKEN
COPY . /app/

RUN echo $GITHUB_OAUTH_TOKEN

RUN chmod +x /app/sync-content
RUN /app/sync-content

RUN npm install
RUN npm run build

EXPOSE 3000
CMD ["node", "--max-http-header-size=24000", "/app/dist/main.js"]
