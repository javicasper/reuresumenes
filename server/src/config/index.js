import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

export default {
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGO_URI || 'mongodb://admin:password@mongodb:27017/audiodb?authSource=admin',
  openaiApiKey: process.env.OPENAI_API_KEY,
  uploadDir: path.join(__dirname, '../../uploads')
};