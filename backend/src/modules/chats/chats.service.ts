import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';

@Injectable()
export class ChatsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new chat for a project
   * @param tenantId - Organization ID
   * @param userId - User ID
   * @param createDto - Chat data
   * @returns Created chat
   */
  async create(tenantId: string, userId: string, createDto: CreateChatDto) {
    // Verify project belongs to tenant
    const project = await this.prisma.project.findFirst({
      where: {
        id: createDto.projectId,
        tenantId,
      },
    });

    if (!project) {
      throw new BadRequestException('Project not found or access denied');
    }

    return this.prisma.chat.create({
      data: {
        title: createDto.title,
        tenantId,
        projectId: createDto.projectId,
        createdBy: userId,
        status: 'ACTIVE',
      },
    });
  }

  /**
   * Get all chats for a project
   * @param projectId - Project ID
   * @param tenantId - Organization ID
   * @returns List of chats
   */
  async findAllByProject(projectId: string, tenantId: string) {
    // Verify project belongs to tenant
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, tenantId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.chat.findMany({
      where: {
        projectId,
        tenantId,
      },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Get a single chat by ID
   * @param id - Chat ID
   * @param tenantId - Organization ID
   * @returns Chat details with messages
   */
  async findOne(id: string, tenantId: string) {
    const chat = await this.prisma.chat.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        project: true,
        creator: {
          select: {
            id: true,
            fullName: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException(`Chat with ID ${id} not found`);
    }

    return chat;
  }
}
