import {
  Controller,
  Get,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  /**
   * POST /messages
   * Create a new message (send message in chat)
   */
  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.messagesService.create(tenantId, userId, createMessageDto);
  }

  /**
   * GET /messages?chatId=xxx
   * Get all messages for a chat
   */
  @Get()
  findAll(
    @Query('chatId') chatId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.messagesService.findAllByChat(chatId, tenantId);
  }
}
