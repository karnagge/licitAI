import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new message in a chat
   * @param tenantId - Organization ID
   * @param userId - User ID
   * @param createDto - Message data
   * @returns Created message
   */
  async create(
    tenantId: string,
    userId: string,
    createDto: CreateMessageDto,
  ) {
    // Verify chat exists and belongs to tenant
    const chat = await this.prisma.chat.findFirst({
      where: {
        id: createDto.chatId,
        tenantId,
      },
    });

    if (!chat) {
      throw new BadRequestException('Chat not found or access denied');
    }

    return this.prisma.$transaction(async (tx) => {
      // Create user message
      const message = await tx.message.create({
        data: {
          chatId: createDto.chatId,
          content: createDto.content,
          role: 'USER',
          createdBy: userId,
        },
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });

      // Update chat message count and timestamp
      await tx.chat.update({
        where: { id: createDto.chatId },
        data: {
          messageCount: { increment: 1 },
          updatedAt: new Date(),
        },
      });

      // TODO: Here we would trigger AI agent orchestration
      // For now, just return the user message
      // Future: Call AI agents to generate response

      return message;
    });
  }

  /**
   * Get all messages for a chat
   * @param chatId - Chat ID
   * @param tenantId - Organization ID
   * @returns List of messages
   */
  async findAllByChat(chatId: string, tenantId: string) {
    // Verify chat belongs to tenant
    const chat = await this.prisma.chat.findFirst({
      where: { id: chatId, tenantId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return this.prisma.message.findMany({
      where: { chatId },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
