FROM node:16-alpine

WORKDIR /app
COPY . /app/

# Build site including dev dependencies
ENV NODE_ENV production
RUN npm install --include=dev

RUN npm run build

# Reinstall only production dependencies
RUN npm install
RUN chmod +x /app/start

EXPOSE 3000
CMD ["/app/bootstrap.sh"]