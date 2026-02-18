import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { AdminModule } from '@/admin/admin.module';
import { ClientModule } from '@/client/client.module';
import { JsonStorageService } from './database/json-storage.service';
import { DatabaseType } from './database/data-source';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AdminModule,
    ClientModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'DATABASE_TYPE',
      useFactory: (configService: ConfigService) => configService.get<DatabaseType>('DB_TYPE') || 'json',
      inject: [ConfigService],
    },
    JsonStorageService,
  ],
  exports: [JsonStorageService],
})
export class AppModule {}
