import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { ApiCommonResponse } from 'src/decorators/api-common-response.decorator';
import { RoleGuard } from '../auth/guards/role.guard';
import { ERole } from './users.constants';
import { UserId } from '../auth/decorators/user-id.decorator';
import { ReadUserDto } from './dto/readUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { PaginationDecorator } from 'src/decorators/pagination.decorator';
import { PaginationQuery } from 'src/decorators/pagination.decorator';
import { PaginationInterceptor } from 'src/interceptors/pagination.interceptor';
import { Pagination } from 'src/shared/types';

@Controller('users')
@ApiTags('users')
@UseGuards(RoleGuard([ERole.user, ERole.admin]))
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    operationId: 'user.readMe',
    summary: 'Get user profile',
    description: 'Get user profile',
  })
  @ApiResponse({
    type: ReadUserDto,
    status: HttpStatus.OK,
    description: 'Successful',
  })
  @ApiCommonResponse()
  read(@UserId() userId: number) {
    return this.usersService.readUser(userId);
  }

  @Patch('update-profile')
  @ApiOperation({
    operationId: 'user.updateProfile',
    summary: 'Update user profile',
    description: 'Update user profile',
  })
  @ApiResponse({
    type: ReadUserDto,
    status: HttpStatus.OK,
    description: 'Successful',
  })
  @ApiCommonResponse()
  updateProfile(@UserId() userId: number, @Body() body: UpdateUserDto) {
    return this.usersService.updateProfile(userId, body);
  }

  @Get()
  @PaginationQuery()
  @ApiOperation({
    operationId: 'generation.list',
    description: 'Listing generations of a user',
    summary: 'Listing generations of a user',
  })
  @UseGuards(RoleGuard([ERole.admin]))
  @ApiResponse({
    type: [ReadUserDto],
    status: HttpStatus.OK,
    description: 'Successful',
  })
  @ApiCommonResponse()
  @UseInterceptors(PaginationInterceptor)
  find(@PaginationDecorator() pagination: Pagination) {
    return this.usersService.findAll(pagination);
  }
}
