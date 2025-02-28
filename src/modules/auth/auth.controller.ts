import { Body, Controller, Post, UseGuards, Req, HttpStatus, Get, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiCommonResponse } from 'src/decorators/api-common-response.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { IJwtPayload } from '../jwt/jwt.type';
import { SignUpDto } from './dto/signUp.dto';
import { PublicEndpoint } from './decorators/publicEndpoint';
import { SignInDto } from './dto/signIn.dto';
import { RefreshTokenResponseDto } from './dto/refresh-token-response.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { ReadUserDto } from '../users/dto/readUser.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UpdatePasswordDto } from './dto/update-password.dto';
// import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-up')
  @PublicEndpoint()
  @ApiOperation({
    operationId: 'auth.signUp',
    summary: 'Sign up',
    description: 'Sign up',
  })
  @ApiCommonResponse()
  @ApiResponse({
    type: ReadUserDto,
    status: HttpStatus.OK,
    description: 'Successful',
  })
  create(@Body() input: SignUpDto) {
    return this.authService.signUp(input);
  }

  // @Post('send-mail-verify-email')
  // @ApiOperation({
  //   operationId: 'auth.sendMailVerifyEmail',
  //   summary: 'Send mail verify email',
  //   description: 'Send mail verify email',
  // })
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  // sendMailVerifyEmail(@Req() req: Request & { user: IJwtPayload }) {
  //   return this.authService.sendMailVerifyEmailByUserId(req.user.sub);
  // }

  // @Post('verify-email')
  // @PublicEndpoint()
  // @ApiOperation({
  //   operationId: 'auth.verifyEmail',
  //   summary: 'Verify email',
  //   description: 'Verify email',
  // })
  // @ApiCommonResponse()
  // @ApiResponse({
  //   type: ReadUserDto,
  //   status: HttpStatus.OK,
  //   description: 'Successful',
  // })
  // verifyEmail(@Body() input: VerifyEmailDto) {
  //   return this.authService.verifyEmail(input);
  // }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @PublicEndpoint()
  @ApiOperation({
    operationId: 'auth.login',
    summary: 'Login',
    description: 'Login',
  })
  @ApiBody({
    type: SignInDto,
  })
  @ApiResponse({
    type: RefreshTokenResponseDto,
    status: HttpStatus.OK,
    description: 'Successful',
  })
  async login(@Req() req: Request & { user: IJwtPayload }) {
    return this.authService.signPayload(req.user);
  }

  @Post('forgot-password')
  @ApiOperation({
    operationId: 'auth.forgotPassword',
    summary: 'Forgot password',
    description: 'Forgot password',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successful',
  })
  @PublicEndpoint()
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Patch('reset-password')
  @ApiOperation({
    operationId: 'auth.resetPassword',
    summary: 'Reset password',
    description: 'Sign up',
  })
  @PublicEndpoint()
  @ApiResponse({
    type: ReadUserDto,
    status: HttpStatus.OK,
    description: 'Successful',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Patch('update-password')
  @ApiOperation({
    operationId: 'auth.updatePassword',
    summary: 'Update password',
    description: 'Update password',
  })
  @ApiBearerAuth()
  @ApiResponse({
    type: ReadUserDto,
    status: HttpStatus.OK,
    description: 'Successful',
  })
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Req() req: Request & { user: IJwtPayload },
  ) {
    return this.authService.updatePassword(req.user.sub, updatePasswordDto);
  }

  @Get('refresh-token')
  @ApiResponse({
    type: RefreshTokenResponseDto,
    status: HttpStatus.OK,
    description: 'Successful',
  })
  @ApiOperation({
    operationId: 'auth.refreshToken',
    summary: 'Refresh token',
    description: 'Refresh token, use refresh token as authorization to use this endpoint',
  })
  @ApiBearerAuth()
  @UseGuards(RefreshTokenGuard)
  async refreshToken(
    @Req() req: Request & { user: IJwtPayload },
  ): Promise<RefreshTokenResponseDto> {
    return this.authService.refreshToken(req.user);
  }
}
