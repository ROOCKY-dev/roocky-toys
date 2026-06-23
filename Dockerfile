FROM node:20-alpine
RUN apk add --no-cache python3 ffmpeg
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "start"]
