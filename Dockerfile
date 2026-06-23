FROM node:20-alpine
RUN apk add --no-cache python3 py3-pip ffmpeg
RUN pip install yt-dlp discord.py --break-system-packages
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "start"]
