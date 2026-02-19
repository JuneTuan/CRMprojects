FROM node:20

RUN apt-get update && apt-get install -y ca-certificates && \
    update-ca-certificates

WORKDIR /app

COPY package*.json ./

ENV NODE_TLS_REJECT_UNAUTHORIZED=0
ENV npm_config_strict_ssl=false
ENV npm_config_registry=https://registry.npmmirror.com

RUN npm cache clean --force && \
    npm install

COPY dist ./dist

EXPOSE 3001

CMD ["node", "dist/main.js"]