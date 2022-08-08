FROM node:16-alpine
WORKDIR /app

RUN apk add jq curl

ENV NODE_ENV production
ARG GITHUB_OAUTH_TOKEN
COPY . /app/

RUN chmod +x /app/start

RUN npm install
RUN npm run build

EXPOSE 3000
CMD ["/app/start"]
