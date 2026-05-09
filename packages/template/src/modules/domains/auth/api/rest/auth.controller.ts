import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { parseDurationToMilliseconds } from '../../../../../libs/duration';
import type {
  AuthResponse,
  AuthenticatedUser,
  UserProfile,
} from '../../app/auth.types';
import { GetCurrentUserUseCase } from '../../app/use-cases/get-current-user.use-case';
import { LoginUseCase } from '../../app/use-cases/login.use-case';
import { LogoutUseCase } from '../../app/use-cases/logout.use-case';
import { RefreshSessionUseCase } from '../../app/use-cases/refresh-session.use-case';
import { RegisterUseCase } from '../../app/use-cases/register.use-case';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { PermissionsGuard } from '../guard/permissions.guard';
import { AuthHttpExceptionFilter } from './auth-http-exception.filter';
import { CurrentUser } from './current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

const authRouteRateLimits = {
  register: {
    limit: 3,
    ttl: parseDurationToMilliseconds('10m', 600_000),
    blockDuration: parseDurationToMilliseconds('30m', 1_800_000),
  },
  login: {
    limit: 5,
    ttl: parseDurationToMilliseconds('1m', 60_000),
    blockDuration: parseDurationToMilliseconds('5m', 300_000),
  },
  refresh: {
    limit: 10,
    ttl: parseDurationToMilliseconds('1m', 60_000),
    blockDuration: parseDurationToMilliseconds('5m', 300_000),
  },
} as const;

@Controller('auth')
@UseFilters(AuthHttpExceptionFilter)
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshSessionUseCase: RefreshSessionUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
  ) {}

  @Post('register')
  @Throttle({
    default: authRouteRateLimits.register,
  })
  async register(
    @Body() body: RegisterDto,
    @Req() request: Request,
  ): Promise<AuthResponse> {
    return this.registerUseCase.execute(body, extractRequestMetadata(request));
  }

  @Post('login')
  @Throttle({
    default: authRouteRateLimits.login,
  })
  @HttpCode(200)
  async login(
    @Body() body: LoginDto,
    @Req() request: Request,
  ): Promise<AuthResponse> {
    return this.loginUseCase.execute(body, extractRequestMetadata(request));
  }

  @Post('refresh')
  @Throttle({
    default: authRouteRateLimits.refresh,
  })
  @HttpCode(200)
  async refresh(
    @Body() body: RefreshTokenDto,
    @Req() request: Request,
  ): Promise<AuthResponse> {
    return this.refreshSessionUseCase.execute(
      body.refreshToken,
      extractRequestMetadata(request),
    );
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  async logout(@CurrentUser() currentUser: AuthenticatedUser): Promise<void> {
    await this.logoutUseCase.execute(currentUser);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  async me(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<UserProfile> {
    return this.getCurrentUserUseCase.execute(currentUser);
  }
}

function extractRequestMetadata(request: Request) {
  return {
    ipAddress: request.ip,
    userAgent: request.get('user-agent') ?? undefined,
  };
}
