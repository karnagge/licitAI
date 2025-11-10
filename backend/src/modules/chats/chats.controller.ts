import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  /**
   * POST /chats
   * Create a new chat
   */
  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() createChatDto: CreateChatDto,
  ) {
    return this.chatsService.create(tenantId, userId, createChatDto);
  }

  /**
   * GET /chats?projectId=xxx
   * Get all chats for a project
   */
  @Get()
  findAll(
    @Query('projectId') projectId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.chatsService.findAllByProject(projectId, tenantId);
  }

  /**
   * GET /chats/:id
   * Get a single chat with messages
   */
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.chatsService.findOne(id, tenantId);
  }
}
