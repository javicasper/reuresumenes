FROM node:18-alpine

# Instalar FFmpeg y otras dependencias necesarias
RUN apk add --no-cache ffmpeg

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el código fuente
COPY . .

# Crear directorio para archivos de audio
RUN mkdir -p uploads
RUN mkdir -p uploads/temp_chunks

# Exponer puerto para la API
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]