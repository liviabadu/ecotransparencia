# Imagem para Cloud Run (Firebase Hosting rewrite /api/** → serviço)
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY index.js mock-data.js score-engine.js cnae-profile.js ./
ENV PORT=8080
EXPOSE 8080
USER node
CMD ["node", "index.js"]
