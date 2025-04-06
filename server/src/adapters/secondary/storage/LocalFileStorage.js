import fs from 'fs/promises';
import { createReadStream, existsSync } from 'fs';
import path from 'path';
import FileStoragePort from '../../../ports/FileStoragePort.js';

export default class LocalFileStorage extends FileStoragePort {
  constructor(baseDir) {
    super();
    this.baseDir = baseDir;
    this._ensureDirectoryExists();
  }

  async _ensureDirectoryExists() {
    try {
      await fs.access(this.baseDir);
    } catch {
      await fs.mkdir(this.baseDir, { recursive: true });
    }
  }

  async saveFile(file) {
    // Con Multer, el archivo ya está guardado, simplemente devolvemos la información
    return {
      filename: path.basename(file.path),
      originalName: file.name,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size
    };
  }

  async getFile(filename) {
    const filePath = path.join(this.baseDir, filename);
    
    if (!existsSync(filePath)) {
      return null;
    }
    
    return createReadStream(filePath);
  }

  async deleteFile(filename) {
    const filePath = path.join(this.baseDir, filename);
    
    if (!existsSync(filePath)) {
      return false;
    }
    
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error al eliminar el archivo:', error);
      return false;
    }
  }
}