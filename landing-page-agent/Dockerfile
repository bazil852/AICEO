FROM node:20-slim

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY . .

EXPOSE ${PORT:-3002}

CMD ["node", "server.js"]
