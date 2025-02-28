import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ERole } from '../users.constants';

export class CreateUserDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty({ enum: ERole })
  @IsEnum(ERole)
  role: ERole;
}
