export class Audio {
  constructor({
    id = null,
    filename,
    originalName,
    path,
    mimetype,
    size,
    duration = null,
    uploadDate = new Date(),
    transcription = null,
    transcriptionProgress = 0,
    summary = null,
    summaryProgress = 0
  }) {
    this.id = id;
    this.filename = filename;
    this.originalName = originalName;
    this.path = path;
    this.mimetype = mimetype;
    this.size = size;
    this.duration = duration;
    this.uploadDate = uploadDate;
    this.transcription = transcription;
    this.transcriptionProgress = transcriptionProgress;
    this.summary = summary;
    this.summaryProgress = summaryProgress;
  }
}

export class Transcription {
  constructor({
    id = null,
    audioId,
    text,
    createdAt = new Date()
  }) {
    this.id = id;
    this.audioId = audioId;
    this.text = text;
    this.createdAt = createdAt;
  }
}

export class Summary {
  constructor({
    id = null,
    transcriptionId,
    text,
    keyPoints = [],
    createdAt = new Date()
  }) {
    this.id = id;
    this.transcriptionId = transcriptionId;
    this.text = text;
    this.keyPoints = keyPoints;
    this.createdAt = createdAt;
  }
}