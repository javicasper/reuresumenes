import { spawn } from 'child_process';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

class AudioSplitter {
  /**
   * Divide un archivo de audio en fragmentos del tamaño especificado
   * @param {string} filePath - Ruta al archivo de audio
   * @param {number} chunkSizeMB - Tamaño de cada fragmento en MB (por defecto 20MB)
   * @param {string} outputDir - Directorio donde se guardarán los fragmentos
   * @returns {Promise<string[]>} - Array con las rutas de los fragmentos creados
   */
  async splitAudio(filePath, chunkSizeMB = 20, outputDir) {
    // Crear el directorio temporal si no existe
    const tempDir = outputDir || path.join(path.dirname(filePath), 'temp_chunks');
    if (!existsSync(tempDir)) {
      await fs.mkdir(tempDir, { recursive: true });
    }

    // Obtener el nombre base del archivo
    const fileBaseName = path.basename(filePath, path.extname(filePath));
    
    // Generar un código único para esta operación
    const uniqueId = Date.now().toString();
    
    // Comando para obtener la duración total del audio
    return new Promise((resolve, reject) => {
      const getDuration = spawn('ffprobe', [
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        filePath
      ]);
      
      let duration = '';
      
      getDuration.stdout.on('data', (data) => {
        duration += data.toString();
      });
      
      getDuration.on('close', async (code) => {
        if (code !== 0) {
          return reject(new Error('Error obteniendo la duración del audio'));
        }
        
        // Convertir duración a segundos
        const totalDuration = parseFloat(duration.trim());
        
        // Calcular cuántos chunks necesitamos basado en el tamaño del archivo
        const fileStats = await fs.stat(filePath);
        const fileSizeMB = fileStats.size / (1024 * 1024);
        const numChunks = Math.ceil(fileSizeMB / chunkSizeMB);
        
        // Calcular la duración de cada fragmento
        const chunkDuration = totalDuration / numChunks;
        
        console.log(`Dividiendo archivo de ${fileSizeMB.toFixed(2)} MB en ${numChunks} fragmentos de aproximadamente ${chunkDuration.toFixed(2)} segundos cada uno`);
        
        const chunkPaths = [];
        
        // Crear cada fragmento
        for (let i = 0; i < numChunks; i++) {
          const startTime = i * chunkDuration;
          const outputPath = path.join(tempDir, `${fileBaseName}_chunk_${uniqueId}_${i}${path.extname(filePath)}`);
          
          // Usar ffmpeg para cortar el audio
          const ffmpeg = spawn('ffmpeg', [
            '-i', filePath,
            '-ss', startTime.toString(),
            '-t', chunkDuration.toString(),
            '-c', 'copy',
            outputPath
          ]);
          
          await new Promise((resolveChunk, rejectChunk) => {
            ffmpeg.on('close', (code) => {
              if (code !== 0) {
                rejectChunk(new Error(`Error al crear el fragmento ${i}`));
              } else {
                chunkPaths.push(outputPath);
                resolveChunk();
              }
            });
            
            ffmpeg.stderr.on('data', (data) => {
              // FFmpeg escribe información en stderr, no es necesariamente un error
              console.log(`FFmpeg (chunk ${i}): ${data.toString()}`);
            });
          });
        }
        
        resolve(chunkPaths);
      });
      
      getDuration.stderr.on('data', (data) => {
        console.error(`FFprobe error: ${data.toString()}`);
      });
      
      getDuration.on('error', (err) => {
        reject(new Error(`Error ejecutando FFprobe: ${err.message}`));
      });
    });
  }
  
  /**
   * Elimina los archivos de fragmentos temporales
   * @param {string[]} chunkPaths - Array con las rutas de los fragmentos
   */
  async cleanupChunks(chunkPaths) {
    for (const chunkPath of chunkPaths) {
      try {
        await fs.unlink(chunkPath);
      } catch (error) {
        console.error(`Error eliminando fragmento ${chunkPath}:`, error);
      }
    }
  }
}

export default AudioSplitter;