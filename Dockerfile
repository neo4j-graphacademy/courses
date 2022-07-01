FROM node:14-alpine
WORKDIR /app
COPY package*.json /app/
RUN NODE_ENV=production npm install
ENV NODE_ENV production
COPY . /app/
RUN npm run build

#FROM node:14-alpine
#WORKDIR /app
#COPY --from=build /app/ .
#COPY --from=build /app/node_modules /app/node_modules
EXPOSE 3000
CMD ["node", "--max-http-header-size=24000", "/app/dist/main.js"]


