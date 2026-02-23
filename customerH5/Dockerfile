FROM node:20-alpine

WORKDIR /app

# 禁用SSL验证并使用国内镜像源
RUN npm config set strict-ssl false && \
    npm config set registry https://registry.npmmirror.com

COPY package*.json ./

# 清理可能存在的node_modules并安装依赖
RUN rm -rf node_modules && npm install

COPY . .

RUN chmod +x start.sh

ENV HOST=0.0.0.0
ENV PORT=5173

EXPOSE 5173

CMD ["./start.sh"]