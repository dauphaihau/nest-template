import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../../app/auth.service';
import type {
  AuthResponse,
  AuthenticatedUser,
  UserProfile,
} from '../../app/auth.types';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { PermissionsGuard } from '../guard/permissions.guard';
import { CurrentUser } from './current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: RegisterDto,
    @Req() request: Request,
  ): Promise<AuthResponse> {
    return this.authService.register(body, extractRequestMetadata(request));
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() body: LoginDto,
    @Req() request: Request,
  ): Promise<AuthResponse> {
    return this.authService.login(body, extractRequestMetadata(request));
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Body() body: RefreshTokenDto,
    @Req() request: Request,
  ): Promise<AuthResponse> {
    return this.authService.refresh(
      body.refreshToken,
      extractRequestMetadata(request),
    );
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  async logout(@CurrentUser() currentUser: AuthenticatedUser): Promise<void> {
    await this.authService.logout(currentUser);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  async me(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<UserProfile> {
    return this.authService.getCurrentUser(currentUser);
  }
}

function extractRequestMetadata(request: Request) {
  return {
    ipAddress: request.ip,
    userAgent: request.get('user-agent') ?? undefined,
  };
}
