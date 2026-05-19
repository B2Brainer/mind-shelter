import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './application/services/auth.service';
import { JournalEntriesService } from './application/services/journal-entries.service';
import configuration from './config/configuration';
import {
  JOURNAL_ENTRIES_REPOSITORY,
  USERS_REPOSITORY,
} from './application/tokens';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { JwtAuthGuard } from './infrastructure/auth/jwt-auth.guard';
import { PrismaJournalEntryRepository } from './infrastructure/persistence/prisma-journal-entry.repository';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import { AuthController } from './interface/http/auth.controller';
import { HealthController } from './interface/http/health.controller';
import { JournalEntriesController } from './interface/http/journal-entries.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
      load: [configuration],
    }),
    PrismaModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('auth.jwtSecret'),
        signOptions: {
          expiresIn: configService.get<string>('auth.jwtExpiresIn', '1d'),
        },
      }),
    }),
  ],
  controllers: [HealthController, AuthController, JournalEntriesController],
  providers: [
    {
      provide: USERS_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: JOURNAL_ENTRIES_REPOSITORY,
      useClass: PrismaJournalEntryRepository,
    },
    AuthService,
    JournalEntriesService,
    JwtAuthGuard,
  ],
  exports: [USERS_REPOSITORY, JOURNAL_ENTRIES_REPOSITORY],
})
export class AppModule {}

