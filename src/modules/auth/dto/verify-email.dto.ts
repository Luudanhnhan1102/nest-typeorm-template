import { IsString, IsNumber } from 'class-validator';

export class VerifyEmailDto {
  @IsNumber()
  userId: number;

  @IsString()
  token: string;
}
