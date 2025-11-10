import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { OrchestrationService } from '../ai-agents/orchestration.service';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private orchestration: OrchestrationService,
  ) {}

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
      const updatedChat = await tx.chat.update({
        where: { id: createDto.chatId },
        data: {
          messageCount: { increment: 1 },
          updatedAt: new Date(),
        },
        include: {
          project: {
            include: {
              documents: {
                where: { status: 'DRAFT' },
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
        },
      });

      // Trigger AI agent orchestration if there's a draft document
      if (updatedChat.project.documents.length > 0) {
        const draftDocument = updatedChat.project.documents[0];

        // Call orchestration asynchronously (fire and forget)
        // The actual generation happens in background
        // For real-time updates, use the streaming endpoint
        this.orchestration
          .handleChatMessage(createDto.chatId, createDto.content)
          .then(async (result) => {
            // Create AI response message
            await this.prisma.message.create({
              data: {
                chatId: createDto.chatId,
                content: result.response,
                role: 'ASSISTANT',
                createdBy: userId, // System user in production
                metadata: { intent: result.intent },
              },
            });

            // Update chat count
            await this.prisma.chat.update({
              where: { id: createDto.chatId },
              data: { messageCount: { increment: 1 } },
            });
          })
          .catch((error) => {
            console.error('AI orchestration failed:', error);
          });
      }

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
