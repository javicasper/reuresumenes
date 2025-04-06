# Sistema de Transcripción y Resumen de Audio

Este proyecto es una aplicación web que permite subir archivos de audio para transcribirlos automáticamente y generar resúmenes utilizando la API de OpenAI.

## Características

- Subida de archivos de audio (formatos mp3, wav, ogg, m4a, etc.)
- Transcripción automática de archivos de audio usando OpenAI Whisper
- División automática de archivos grandes en fragmentos para cumplir con los límites de la API
- Generación de resúmenes de las transcripciones usando GPT-4o
- Capacidad para rehacer los resúmenes de transcripciones existentes
- Descarga de archivos de audio, transcripciones y resúmenes
- Interfaz de usuario intuitiva y responsiva

## Estructura del Proyecto

El proyecto está dividido en dos partes principales:

- **Cliente**: Aplicación React que proporciona la interfaz de usuario.
- **Servidor**: API RESTful basada en Node.js y Express con arquitectura hexagonal.

## Requisitos Previos

- [Node.js](https://nodejs.org/) (v14 o superior)
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/) (opcional, para despliegue en contenedores)
- [FFmpeg](https://ffmpeg.org/) (para procesar archivos de audio grandes)
- Clave API de [OpenAI](https://openai.com/api/) (para usar los servicios de transcripción y resumen)

## Instalación y Configuración

### Usando Docker (recomendado)

1. Clona este repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd audio-transcription-system
   ```

2. Crea un archivo `.env` en la carpeta `server` con la siguiente configuración:
   ```
   PORT=3000
   MONGODB_URI=mongodb://mongodb:27017/audio-transcription
   OPENAI_API_KEY=tu_clave_api_de_openai
   UPLOAD_DIR=uploads
   ```

3. Inicia los contenedores con Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. Accede a la aplicación en: http://localhost:8080

### Instalación Manual

#### Servidor

1. Navega a la carpeta del servidor:
   ```bash
   cd server
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Crea un archivo `.env` con la configuración necesaria:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/audio-transcription
   OPENAI_API_KEY=tu_clave_api_de_openai
   UPLOAD_DIR=uploads
   ```

4. Inicia el servidor:
   ```bash
   npm start
   ```

#### Cliente

1. Navega a la carpeta del cliente:
   ```bash
   cd client
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia la aplicación:
   ```bash
   npm start
   ```

4. Accede a la aplicación en: http://localhost:3000

## Uso

1. Accede a la interfaz web.
2. Utiliza el formulario de carga para subir un archivo de audio.
3. Una vez subido, aparecerá en la lista de archivos.
4. Haz clic en "Transcribir Audio" para iniciar el proceso de transcripción.
5. Cuando la transcripción esté completa, puedes hacer clic en "Generar Resumen".
6. Utiliza los botones para descargar archivos, reproducir audio, etc.
7. Si deseas generar un nuevo resumen, utiliza el botón "Rehacer Resumen".

## Arquitectura

Este proyecto utiliza una arquitectura hexagonal (puertos y adaptadores):

- **Domain**: Contiene las entidades de negocio.
- **Ports**: Define interfaces para interactuar con servicios externos.
- **Adapters**: Implementaciones concretas de los puertos.
  - **Primary**: Manejadores de entrada (controladores, rutas).
  - **Secondary**: Implementaciones de salida (base de datos, almacenamiento, servicios externos).
- **Application**: Casos de uso que orquestan las operaciones.

## Tecnologías Utilizadas

### Backend
- Node.js y Express
- MongoDB (con Mongoose)
- OpenAI API (Whisper y GPT-4o)
- Arquitectura Hexagonal
- Multer para gestión de archivos
- FFmpeg para procesamiento de audio

### Frontend
- React
- Axios para peticiones HTTP
- CSS para estilos

## Contribuir

1. Haz un fork del repositorio
2. Crea una rama para tu feature: `git checkout -b feature/nueva-caracteristica`
3. Haz commit de tus cambios: `git commit -m 'Añade nueva característica'`
4. Empuja a la rama: `git push origin feature/nueva-caracteristica`
5. Abre un Pull Request

## Licencia

[MIT](LICENSE)

## Contacto

Para preguntas o sugerencias, por favor abre un issue en este repositorio.