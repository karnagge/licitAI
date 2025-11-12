import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    project: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockTenantId = 'tenant-123';
  const mockUserId = 'user-123';
  const mockProject = {
    id: 'project-123',
    name: 'Pregão Eletrônico 001/2024',
    description: 'Aquisição de equipamentos de TI',
    tenantId: mockTenantId,
    createdBy: mockUserId,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new project', async () => {
      const createDto = {
        name: 'Pregão Eletrônico 001/2024',
        description: 'Aquisição de equipamentos de TI',
      };

      mockPrismaService.project.create.mockResolvedValue(mockProject);

      const result = await service.create(mockTenantId, mockUserId, createDto);

      expect(result).toEqual(mockProject);
      expect(prisma.project.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          tenantId: mockTenantId,
          createdBy: mockUserId,
          status: 'ACTIVE',
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated projects', async () => {
      const mockProjects = [mockProject];
      mockPrismaService.project.findMany.mockResolvedValue(mockProjects);
      mockPrismaService.project.count.mockResolvedValue(1);

      const result = await service.findAll(mockTenantId, 1, 10);

      expect(result).toEqual({
        data: mockProjects,
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });
      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: { tenantId: mockTenantId },
        skip: 0,
        take: 10,
        orderBy: { updatedAt: 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          _count: {
            select: {
              documents: true,
              chats: true,
            },
          },
        },
      });
    });

    it('should calculate pagination correctly', async () => {
      mockPrismaService.project.findMany.mockResolvedValue([]);
      mockPrismaService.project.count.mockResolvedValue(25);

      const result = await service.findAll(mockTenantId, 2, 10);

      expect(result.totalPages).toBe(3);
      expect(result.page).toBe(2);
      expect(prisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a project by id', async () => {
      mockPrismaService.project.findFirst.mockResolvedValue(mockProject);

      const result = await service.findOne(mockProject.id, mockTenantId);

      expect(result).toEqual(mockProject);
      expect(prisma.project.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockProject.id,
          tenantId: mockTenantId,
        },
        include: {
          creator: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          documents: {
            orderBy: { updatedAt: 'desc' },
            take: 5,
          },
          chats: {
            orderBy: { updatedAt: 'desc' },
            take: 5,
          },
        },
      });
    });

    it('should throw NotFoundException if project not found', async () => {
      mockPrismaService.project.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne('non-existent-id', mockTenantId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      const updateDto = { name: 'Updated Name' };
      const updatedProject = { ...mockProject, ...updateDto };

      mockPrismaService.project.findFirst.mockResolvedValue(mockProject);
      mockPrismaService.project.update.mockResolvedValue(updatedProject);

      const result = await service.update(
        mockProject.id,
        mockTenantId,
        updateDto,
      );

      expect(result).toEqual(updatedProject);
      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: mockProject.id },
        data: updateDto,
      });
    });

    it('should throw NotFoundException if project not found', async () => {
      mockPrismaService.project.findFirst.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', mockTenantId, { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a project by archiving', async () => {
      const archivedProject = { ...mockProject, status: 'ARCHIVED' };
      mockPrismaService.project.findFirst.mockResolvedValue(mockProject);
      mockPrismaService.project.update.mockResolvedValue(archivedProject);

      await service.remove(mockProject.id, mockTenantId);

      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: mockProject.id },
        data: { status: 'ARCHIVED' },
      });
    });

    it('should throw NotFoundException if project not found', async () => {
      mockPrismaService.project.findFirst.mockResolvedValue(null);

      await expect(
        service.remove('non-existent-id', mockTenantId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
