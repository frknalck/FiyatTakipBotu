FROM node:20-slim

# Sadece gerekli paketler
RUN apt-get update && apt-get install -y \
    ca-certificates \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY . .

RUN mkdir -p logs data && \
    chown -R node:node /app

USER node

EXPOSE 3000

CMD ["npm", "start"]