import { IsString, IsNumber, IsDate, IsOptional, IsArray, IsObject } from 'class-validator';

export class MediaResponseDto {
  @IsNumber()
  id: number;

  @IsString()
  mediaId: string;

  @IsString()
  filename: string;

  @IsString()
  originalName: string;

  @IsString()
  mimeType: string;

  @IsNumber()
  size: number;

  @IsString()
  url: string;

  @IsDate()
  createdAt: Date;
}

export class DocumentResponseDto {
  @IsNumber()
  id: number;

  @IsString()
  documentId: string;

  @IsString()
  name: string;

  @IsString()
  status: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsOptional()
  @IsDate()
  publishedAt?: Date;

  @IsOptional()
  @IsArray()
  slides?: any[];

  @IsOptional()
  @IsArray()
  media?: MediaResponseDto[];

  @IsOptional()
  @IsObject()
  _links?: {
    self: string;
    media: string;
    update: string;
    delete: string;
  };
}

export class DocumentSummaryDto {
  @IsNumber()
  id: number;

  @IsString()
  documentId: string;

  @IsString()
  name: string;

  @IsString()
  status: string;

  @IsDate()
  createdAt: Date;

  @IsNumber()
  mediaCount: number;

  @IsNumber()
  slidesCount: number;
} 