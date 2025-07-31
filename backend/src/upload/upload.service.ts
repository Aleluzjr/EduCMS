import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  async processUpload(file: any) {
    // Gera URL pública para o arquivo
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const fileUrl = `${baseUrl}/uploads/${file.filename}`;
    
    return {
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      url: fileUrl,
      uploadedAt: new Date().toISOString(),
    };
  }
} 