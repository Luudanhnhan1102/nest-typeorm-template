import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  lastName: string;
}
