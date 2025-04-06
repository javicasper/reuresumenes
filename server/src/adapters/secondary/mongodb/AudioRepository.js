import mongoose from 'mongoose';
import { Audio } from '../../../domain/Audio.js';
import AudioRepositoryPort from '../../../ports/AudioRepositoryPort.js';

const AudioSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  path: String,
  mimetype: String,
  size: Number,
  duration: Number,
  uploadDate: { type: Date, default: Date.now },
  // Actualizado para aceptar un objeto con un campo text
  transcription: { 
    type: mongoose.Schema.Types.Mixed, 
    default: null 
  },
  transcriptionProgress: { type: Number, default: 0 },
  // Actualizado para aceptar un objeto con un campo text
  summary: { 
    type: mongoose.Schema.Types.Mixed, 
    default: null 
  },
  summaryProgress: { type: Number, default: 0 }
});

const AudioModel = mongoose.model('Audio', AudioSchema);

export default class AudioRepository extends AudioRepositoryPort {
  async save(audio) {
    const audioModel = new AudioModel({
      filename: audio.filename,
      originalName: audio.originalName,
      path: audio.path,
      mimetype: audio.mimetype,
      size: audio.size,
      duration: audio.duration,
      uploadDate: audio.uploadDate
    });

    const savedAudio = await audioModel.save();
    return this._mapToEntity(savedAudio);
  }

  async findById(id) {
    const audio = await AudioModel.findById(id);
    if (!audio) return null;
    return this._mapToEntity(audio);
  }

  async findAll() {
    const audios = await AudioModel.find().sort({ uploadDate: -1 });
    return audios.map(audio => this._mapToEntity(audio));
  }

  async update(id, audioData) {
    const updatedAudio = await AudioModel.findByIdAndUpdate(
      id,
      audioData,
      { new: true }
    );
    if (!updatedAudio) return null;
    return this._mapToEntity(updatedAudio);
  }

  async delete(id) {
    await AudioModel.findByIdAndDelete(id);
    return true;
  }

  async updateTranscriptionProgress(id, progress) {
    const updatedAudio = await AudioModel.findByIdAndUpdate(
      id,
      { transcriptionProgress: progress },
      { new: true }
    );
    if (!updatedAudio) return null;
    return this._mapToEntity(updatedAudio);
  }

  async updateSummaryProgress(id, progress) {
    const updatedAudio = await AudioModel.findByIdAndUpdate(
      id,
      { summaryProgress: progress },
      { new: true }
    );
    if (!updatedAudio) return null;
    return this._mapToEntity(updatedAudio);
  }

  _mapToEntity(dbAudio) {
    return new Audio({
      id: dbAudio.id.toString(),
      filename: dbAudio.filename,
      originalName: dbAudio.originalName,
      path: dbAudio.path,
      mimetype: dbAudio.mimetype,
      size: dbAudio.size,
      duration: dbAudio.duration,
      uploadDate: dbAudio.uploadDate,
      transcription: dbAudio.transcription,
      transcriptionProgress: dbAudio.transcriptionProgress,
      summary: dbAudio.summary,
      summaryProgress: dbAudio.summaryProgress
    });
  }
}