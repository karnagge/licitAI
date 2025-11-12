import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { ChatsModule } from './modules/chats/chats.module';
import { MessagesModule } from './modules/messages/messages.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { UsersModule } from './modules/users/users.module';
import { SearchModule } from './modules/search/search.module';
import { AiAgentsModule } from './modules/ai-agents/ai-agents.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    OrganizationsModule,
    ProjectsModule,
    TemplatesModule,
    DocumentsModule,
    ChatsModule,
    MessagesModule,
    AttachmentsModule,
    UsersModule,
    SearchModule,
    AiAgentsModule,
  ],
  controllers: [],
  providers: [
    // Global JWT authentication guard
    // All routes require authentication unless marked with @Public()
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // Global logging interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
