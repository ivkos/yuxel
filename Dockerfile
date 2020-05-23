FROM node:12.16-slim
WORKDIR /app

COPY package.json /app/
COPY package-lock.json /app/
RUN npm install

COPY src /app/src
COPY .eslintrc.js .prettierrc nest-cli.json tsconfig.build.json tsconfig.json /app/
RUN npm run build
COPY config.yaml /app/

CMD ["node", "dist/index.js"]
