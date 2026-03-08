FROM node:22-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 ffmpeg pip && \
    pip install --break-system-packages yt-dlp && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 8080
ENV PORT=8080

CMD ["node", "server.js"]
