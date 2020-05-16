FROM node:12.16-slim as builder
COPY package.json /app/
COPY package-lock.json /app/
WORKDIR /app
RUN npm install
COPY ./* /app/
RUN npm run build

FROM node:12.16-slim
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist
COPY config.yaml /app/
WORKDIR /app

CMD ["node", "dist/index.js"]
