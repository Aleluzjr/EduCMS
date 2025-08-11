import { IsOptional, IsString } from 'class-validator';

export class QueryDocumentsDto {
  @IsOptional()
  @IsString()
  withMedia?: string;
}
