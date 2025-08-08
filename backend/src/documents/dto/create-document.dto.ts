import { IsString, IsOptional, IsArray, IsObject } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  documentId?: string;

  @IsOptional()
  @IsArray()
  slides?: any[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
} 