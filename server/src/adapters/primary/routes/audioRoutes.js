import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de multer para guardar archivos
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadsDir = path.join(__dirname, '../../../../uploads');
    // Asegurarse de que el directorio existe
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    // Generar un nombre único basado en timestamp + nombre original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Preservar la extensión original
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// Filtro para aceptar solo archivos de audio
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de audio'), false);
  }
};

// Configurar multer con opciones
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

export default function audioRoutes(audioController) {
  const router = express.Router();

  // Obtener todos los audios
  router.get('/', audioController.getAllAudios.bind(audioController));
  
  // Obtener un audio por ID
  router.get('/:id', audioController.getAudioById.bind(audioController));
  
  // Subir un nuevo audio - usando multer
  router.post('/', upload.single('audio'), (req, res, next) => {
    // Multer añade el archivo a req.file
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo de audio' });
    }
    
    // Transformar el objeto de archivo para que sea compatible con nuestro controlador
    req.audioFile = {
      name: req.file.originalname,
      path: req.file.path,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    };
    
    // Llamar al método del controlador
    audioController.uploadAudio(req, res, next);
  });
  
  // Eliminar un audio
  router.delete('/:id', audioController.deleteAudio.bind(audioController));
  
  // Transcribir un audio
  router.post('/:id/transcribe', audioController.transcribeAudio.bind(audioController));
  
  // Resumir una transcripción
  router.post('/:id/summarize', audioController.summarizeTranscription.bind(audioController));
  
  // Nueva ruta para rehacer el resumen
  router.post('/:id/redo-summary', async (req, res) => {
    try {
      // Pasamos el parámetro id directamente desde req.params
      // El caso de uso se encargará de borrar el resumen antiguo y crear uno nuevo
      const result = await audioController.summarizeTranscription(req, res);
      return result;
    } catch (error) {
      console.error('Error rehaciendo el resumen:', error);
      res.status(500).json({ error: error.message || 'Error rehaciendo el resumen' });
    }
  });
  
  // Transmitir archivo de audio por ID (streaming)
  router.get('/:id/stream', async (req, res) => {
    try {
      const audio = await audioController.getAudioById(req);
      if (!audio) {
        return res.status(404).json({ error: 'Audio no encontrado' });
      }
      
      const filePath = path.join(__dirname, '../../../../uploads', audio.filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Archivo de audio no encontrado' });
      }
      
      res.setHeader('Content-Type', audio.mimetype || 'audio/mpeg');
      fs.createReadStream(filePath).pipe(res);
    } catch (error) {
      console.error('Error al transmitir audio:', error);
      res.status(500).json({ error: 'Error al transmitir el archivo de audio' });
    }
  });
  
  // Descargar archivo de audio
  router.get('/:id/download', async (req, res) => {
    try {
      const audio = await audioController.getAudioById(req);
      if (!audio) {
        return res.status(404).json({ error: 'Audio no encontrado' });
      }
      
      const filePath = path.join(__dirname, '../../../../uploads', audio.filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Archivo de audio no encontrado' });
      }
      
      res.download(filePath, audio.originalName || audio.filename);
    } catch (error) {
      console.error('Error al descargar audio:', error);
      res.status(500).json({ error: 'Error al descargar el archivo de audio' });
    }
  });
  
  // Descargar transcripción
  router.get('/:id/transcription/download', async (req, res) => {
    try {
      const audio = await audioController.getAudioById(req);
      if (!audio || !audio.transcription) {
        return res.status(404).json({ error: 'Transcripción no encontrada' });
      }
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${audio.originalName || audio.filename}-transcripcion.txt"`);
      res.send(audio.transcription.text);
    } catch (error) {
      console.error('Error al descargar transcripción:', error);
      res.status(500).json({ error: 'Error al descargar la transcripción' });
    }
  });
  
  // Descargar resumen
  router.get('/:id/summary/download', async (req, res) => {
    try {
      const audio = await audioController.getAudioById(req);
      if (!audio || !audio.summary) {
        return res.status(404).json({ error: 'Resumen no encontrado' });
      }
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${audio.originalName || audio.filename}-resumen.txt"`);
      res.send(audio.summary.text);
    } catch (error) {
      console.error('Error al descargar resumen:', error);
      res.status(500).json({ error: 'Error al descargar el resumen' });
    }
  });
  
  return router;
}