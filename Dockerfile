FROM node:20-slim

# Chrome ve gerekli paketleri kur
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y \
    google-chrome-stable \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Package.json kopyala ve install
COPY package.json ./
RUN npm install --omit=dev

# Uygulama dosyalarını kopyala
COPY . .

# Gerekli klasörleri oluştur ve permission ver
RUN mkdir -p logs data && \
    chown -R node:node /app

# Chrome path environment variable
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

USER node

EXPOSE 3000

CMD ["npm", "start"]