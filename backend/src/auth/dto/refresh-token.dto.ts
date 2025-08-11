import { IsString, ValidateIf } from 'class-validator';

export class RefreshTokenDto {
  @ValidateIf(o => !o.refreshToken)
  @IsString()
  refresh_token?: string;

  @ValidateIf(o => !o.refresh_token)
  @IsString()
  refreshToken?: string;

  // Getter para obter o token independente do formato
  get token(): string {
    return this.refreshToken || this.refresh_token || '';
  }
} 