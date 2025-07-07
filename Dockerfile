FROM node:24-alpine3.21

WORKDIR /app
COPY . /app/

RUN apk add aws-cli curl jq

# Build site including dev dependencies
ENV NODE_ENV=production
RUN npm install --include=dev

RUN npm run build

# Reinstall only production dependencies
RUN npm install
RUN chmod +x /app/start

EXPOSE 3000

ENTRYPOINT ["/app/start"]
CMD ["start"]
