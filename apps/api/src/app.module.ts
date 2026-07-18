import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';

function validateEnvironment(config: Record<string, unknown>) {
  const jwtSecret =
    typeof config.JWT_SECRET === 'string' ? config.JWT_SECRET.trim() : '';

  if (!jwtSecret) {
    throw new Error('JWT_SECRET deve estar definido para iniciar a aplicação.');
  }

  const databaseUrl =
    typeof config.DATABASE_URL === 'string' ? config.DATABASE_URL.trim() : '';

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL deve estar definida para iniciar a aplicação.',
    );
  }

  const jwtExpiresIn =
    typeof config.JWT_EXPIRES_IN === 'string' && config.JWT_EXPIRES_IN.trim()
      ? config.JWT_EXPIRES_IN.trim()
      : '1h';

  return {
    ...config,
    JWT_SECRET: jwtSecret,
    JWT_EXPIRES_IN: jwtExpiresIn,
    DATABASE_URL: databaseUrl,
  };
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    DatabaseModule,
    AuthModule,
  ],
})
export class AppModule {}
