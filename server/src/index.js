import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/index.js';

// Adaptadores secundarios
import AudioRepository from './adapters/secondary/mongodb/AudioRepository.js';
import LocalFileStorage from './adapters/secondary/storage/LocalFileStorage.js';
import OpenAITranscriptionService from './adapters/secondary/services/OpenAITranscriptionService.js';
import OpenAISummaryService from './adapters/secondary/services/OpenAISummaryService.js';

// Casos de uso
import UploadAudioUseCase from './application/UploadAudioUseCase.js';
import GetAudiosUseCase from './application/GetAudiosUseCase.js';
import GetAudioByIdUseCase from './application/GetAudioByIdUseCase.js';
import DeleteAudioUseCase from './application/DeleteAudioUseCase.js';
import TranscribeAudioUseCase from './application/TranscribeAudioUseCase.js';
import SummarizeTranscriptionUseCase from './application/SummarizeTranscriptionUseCase.js';

// Controladores y rutas
import AudioController from './adapters/primary/controllers/AudioController.js';
import audioRoutes from './adapters/primary/routes/audioRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función principal para iniciar la aplicación
async function startApp() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Conectado a MongoDB');

    // Inicializar adaptadores secundarios
    const audioRepository = new AudioRepository();
    const fileStorage = new LocalFileStorage(config.uploadDir);
    const transcriptionService = new OpenAITranscriptionService(
      config.openaiApiKey,
      audioRepository
    );
    const summaryService = new OpenAISummaryService(
      config.openaiApiKey,
      audioRepository
    );

    // Inicializar casos de uso
    const uploadAudioUseCase = new UploadAudioUseCase(fileStorage, audioRepository);
    const getAudiosUseCase = new GetAudiosUseCase(audioRepository);
    const getAudioByIdUseCase = new GetAudioByIdUseCase(audioRepository);
    const deleteAudioUseCase = new DeleteAudioUseCase(audioRepository, fileStorage);
    const transcribeAudioUseCase = new TranscribeAudioUseCase(transcriptionService, audioRepository);
    const summarizeTranscriptionUseCase = new SummarizeTranscriptionUseCase(summaryService, audioRepository);

    // Inicializar controlador
    const audioController = new AudioController({
      uploadAudioUseCase,
      getAudiosUseCase,
      getAudioByIdUseCase,
      deleteAudioUseCase,
      transcribeAudioUseCase,
      summarizeTranscriptionUseCase
    });

    // Configurar Express
    const app = express();

    // CORS básico que permite todo
    app.use(cors());
    
    app.use(morgan('dev'));
    
    // Configuración básica para JSON y URL encoded
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Ruta para servir archivos estáticos (uploads)
    const uploadsPath = path.join(__dirname, '../../uploads');
    console.log(`Serving static files from: ${uploadsPath}`);
    app.use('/uploads', express.static(uploadsPath));

    // Configurar rutas de la API
    app.use('/api/audios', audioRoutes(audioController));

    // Ruta para verificar que el servidor está funcionando
    app.get('/ping', (req, res) => {
      res.json({ message: 'pong', timestamp: new Date().toISOString() });
    });

    // Iniciar servidor
    app.listen(config.port, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar la aplicación:', error);
    process.exit(1);
  }
}

// Iniciar la aplicación
startApp();