import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

export class CreateMediaDto {
  @IsString()
  filename: string;

  @IsString()
  originalName: string;

  @IsString()
  mimeType: string;

  @IsNumber()
  size: number;

  @IsString()
  path: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsNumber()
  documentId?: number;

  @IsOptional()
  @IsObject()
  metadata?: any;
} 