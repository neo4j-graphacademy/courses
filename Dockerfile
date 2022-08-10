FROM node:16-alpine
WORKDIR /app

RUN apk add jq curl

# Build site including dev dependencies
ARG GITHUB_OAUTH_TOKEN
COPY . /app/

RUN npm install --include=dev

RUN npm run build

ENV NODE_ENV production

# Reinstall only production dependencies
RUN npm install

RUN chmod +x /app/start

EXPOSE 3000
CMD ["/app/start"]
