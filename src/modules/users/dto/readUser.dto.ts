import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { EGender, ERole, EUserStatus } from '../users.constants';

@Exclude()
export class ReadUserDto {
  @Expose()
  @ApiProperty({
    description: `User's email`,
  })
  email: string;

  @Expose()
  @ApiProperty({
    description: `User id`,
  })
  id: number;

  @ApiPropertyOptional({
    description: `givenName in google account`,
  })
  @Expose()
  firstName?: string;

  @ApiPropertyOptional({
    description: `familyName in google account`,
  })
  @Expose()
  lastName?: string;

  @ApiPropertyOptional({
    description: `user's avatar`,
  })
  @Expose()
  avatar?: string;

  @Expose()
  @ApiPropertyOptional({
    description: `user's role`,
  })
  role: ERole;

  @Expose()
  @ApiPropertyOptional({
    description: `user's gender`,
  })
  gender?: EGender;

  @Expose()
  @ApiPropertyOptional({
    description: `user's date of birth`,
  })
  dateOfBirth?: Date;

  @Expose()
  @ApiPropertyOptional({
    description: `user's status`,
  })
  status: EUserStatus;

  @Expose()
  @ApiPropertyOptional()
  isVerifiedMail?: boolean;
}
