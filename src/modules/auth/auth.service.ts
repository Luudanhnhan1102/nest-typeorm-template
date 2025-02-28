import { BadRequestException, Injectable } from '@nestjs/common';
import { SignUpDto } from './dto/signUp.dto';
import { UsersService } from '../users/users.service';
import { ERole } from '../users/users.constants';
import { JwtInternalService } from '../jwt/jwt.service';
import { IJwtPayload } from '../jwt/jwt.type';
import { jwtConfig, serviceConfig } from 'src/common/config/config-helper';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { EUserStatus } from '../users/users.constants';
import { RedisService } from '../redis/redis.service';
// import { VerifyEmailDto } from './dto/verify-email.dto';
// import { ReadUserDto } from '../users/dto/readUser.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtInternalService,
    private mailService: MailService,
    private redisService: RedisService,
  ) {}

  async signUp(dto: SignUpDto) {
    const user = await this.userService.registerUPUser({
      ...dto,
      role: ERole.user,
    });

    // await this.sendMailVerifyEmail(user);

    return user;
  }

  // async sendMailVerifyEmailByUserId(userId: number) {
  //   const user = await this.userService.findByIdOrFail(userId);
  //   return this.sendMailVerifyEmail(user);
  // }

  // async sendMailVerifyEmail(user: ReadUserDto) {
  //   const verificationToken = crypto.randomBytes(32).toString('hex');
  //   const hash = await this.jwtService.hash(verificationToken);

  //   await this.redisService.set(
  //     this.getVerifyEmailKey(user.id),
  //     hash,
  //     jwtConfig.verifyEmail.expireTime,
  //   );

  //   const verificationLink = `${serviceConfig.clientAuthUrl}/verify-email?token=${verificationToken}&id=${user.id}`;

  //   await this.mailService.sendMailVerifyEmail(
  //     user.email,
  //     user.firstName || user.email,
  //     verificationLink,
  //   );
  // }

  // getVerifyEmailKey(userId: number) {
  //   return `email-verification-${userId}`;
  // }

  // async verifyEmail({ userId, token }: VerifyEmailDto) {
  //   const user = await this.userService.findByIdOrFail(userId);

  //   if (user.isVerifiedMail) {
  //     throw new BadRequestException('Email already verified');
  //   }

  //   const storedToken = await this.redisService.get(this.getVerifyEmailKey(userId));
  //   if (!storedToken) {
  //     throw new BadRequestException('Invalid or expired verification token');
  //   }

  //   const isValid = await this.jwtService.compare(token, storedToken);
  //   if (!isValid) {
  //     throw new BadRequestException('Invalid verification token');
  //   }

  //   const updatedUser = await this.userService.verifyEmail(userId);

  //   await this.redisService.delete(this.getVerifyEmailKey(userId));

  //   return updatedUser;
  // }

  async signPayload(user: IJwtPayload) {
    const refreshTokenConfig = jwtConfig.refreshToken;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signPayload(user),
      this.jwtService.signPayload(user, {
        expiresIn: refreshTokenConfig.expireTime,
        secret: refreshTokenConfig.secretKey,
      }),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  getForgotPasswordKey(email: string) {
    return `forgot-password-${email}`;
  }

  async forgotPassword(forgotPassword: ForgotPasswordDto) {
    const user = await this.userService.findByEmailOrFail(forgotPassword.email);
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hash = this.jwtService.hash(resetToken);
    await this.redisService.set(
      this.getForgotPasswordKey(user.email),
      hash,
      jwtConfig.forgotPasswordToken.expireTime,
    );
    const link = `${
      serviceConfig.clientAuthUrl
    }/passwordReset?token=${resetToken}&email=${user.email.toString()}`;
    this.mailService.sendMailResetPassword(user.email, user.firstName || user.email, link);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.userService.findByEmailOrFail(resetPasswordDto.email);
    const passwordResetToken = await this.redisService.get(this.getForgotPasswordKey(user.email));
    if (!passwordResetToken) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    const isValid = this.jwtService.compare(resetPasswordDto.token, passwordResetToken);
    if (!isValid) {
      throw new BadRequestException('Invalid or expired password reset token');
    }
    const updatedUser = await this.userService.updatePassword(user.id, resetPasswordDto.password);
    this.mailService.updatePasswordSuccessfully(user.email, user.firstName || user.email);
    await this.redisService.delete(this.getForgotPasswordKey(user.email));
    return updatedUser;
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user) {
      if (user.password) {
        if (this.jwtService.compare(pass, user.password)) {
          return this.userService.returnUserData(user);
        }
      }
    }
    return null;
  }

  async refreshToken(user: IJwtPayload) {
    const userData = await this.userService.findByIdOrFail(user.sub);
    if (userData.status !== EUserStatus.active) {
      throw new BadRequestException(`User is not active`);
    }

    return this.signPayload({
      role: user.role,
      sub: user.sub,
      email: user.email,
    });
  }

  async updatePassword(userId: number, updatePasswordDto: UpdatePasswordDto) {
    const user = await this.userService.findByIdOrFail(userId);
    const isValid = this.jwtService.compare(updatePasswordDto.currentPassword, user.password);
    if (!isValid) {
      throw new BadRequestException(`Password is incorrect`);
    }

    return this.userService.updatePassword(userId, updatePasswordDto.newPassword);
  }
}
