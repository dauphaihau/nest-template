import { ConfigService } from '@nestjs/config';

export interface StorageConfig {
  driver: 'local';
  localRoot: string;
  publicBaseUrl?: string;
}

export const STORAGE_CONFIG = Symbol('STORAGE_CONFIG');

export function buildStorageConfig(
  configService: Pick<ConfigService, 'get'>,
): StorageConfig {
  return {
    driver: configService.get<'local'>('STORAGE_DRIVER', 'local') ?? 'local',
    localRoot: configService.get<string>('STORAGE_LOCAL_ROOT', './storage'),
    publicBaseUrl: configService.get<string>('STORAGE_PUBLIC_BASE_URL'),
  };
}
