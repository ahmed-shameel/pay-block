import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { PaymentsModule } from './payments/payments.module';
import { ContractsModule } from './contracts/contracts.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import appConfig from './common/config/app.config';
import databaseConfig from './common/config/database.config';

@Module({
  imports: [
    // ── Config ──────────────────────────────────────────────
    // ConfigModule is global so every module can inject ConfigService
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
    }),

    // ── Database ─────────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.user'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.name'),
        autoLoadEntities: true,
        // In production set synchronize to false and run migrations explicitly.
        synchronize: config.get<string>('app.nodeEnv') !== 'production',
        migrationsTableName: 'migrations',
        migrations: ['dist/migrations/*.js'],
      }),
    }),

    // ── Feature modules ──────────────────────────────────────
    AuthModule,
    PaymentsModule,
    ContractsModule,
    BlockchainModule,
  ],
})
export class AppModule {}
