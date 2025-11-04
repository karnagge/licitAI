import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Modules will be added during Phase 2 and Phase 3
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
