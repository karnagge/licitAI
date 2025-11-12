import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: ProjectsService;

  const mockProjectsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockTenantId = 'tenant-123';
  const mockUserId = 'user-123';
  const mockProject = {
    id: 'project-123',
    name: 'Pregão Eletrônico 001/2024',
    description: 'Aquisição de equipamentos de TI',
    tenantId: mockTenantId,
    createdById: mockUserId,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: mockProjectsService,
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get<ProjectsService>(ProjectsService);
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

      mockProjectsService.create.mockResolvedValue(mockProject);

      const result = await controller.create(
        mockTenantId,
        mockUserId,
        createDto,
      );

      expect(result).toEqual(mockProject);
      expect(service.create).toHaveBeenCalledWith(
        mockTenantId,
        mockUserId,
        createDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated projects', async () => {
      const paginatedResult = {
        data: [mockProject],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };

      mockProjectsService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(mockTenantId, '1', '10');

      expect(result).toEqual(paginatedResult);
      expect(service.findAll).toHaveBeenCalledWith(mockTenantId, 1, 10);
    });

    it('should use default pagination values', async () => {
      mockProjectsService.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      });

      await controller.findAll(mockTenantId);

      expect(service.findAll).toHaveBeenCalledWith(mockTenantId, undefined, undefined);
    });
  });

  describe('findOne', () => {
    it('should return a single project', async () => {
      mockProjectsService.findOne.mockResolvedValue(mockProject);

      const result = await controller.findOne(mockProject.id, mockTenantId);

      expect(result).toEqual(mockProject);
      expect(service.findOne).toHaveBeenCalledWith(
        mockProject.id,
        mockTenantId,
      );
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      const updateDto = { name: 'Updated Name' };
      const updatedProject = { ...mockProject, ...updateDto };

      mockProjectsService.update.mockResolvedValue(updatedProject);

      const result = await controller.update(
        mockProject.id,
        mockTenantId,
        updateDto,
      );

      expect(result).toEqual(updatedProject);
      expect(service.update).toHaveBeenCalledWith(
        mockProject.id,
        mockTenantId,
        updateDto,
      );
    });
  });

  describe('remove', () => {
    it('should archive a project', async () => {
      mockProjectsService.remove.mockResolvedValue(undefined);

      await controller.remove(mockProject.id, mockTenantId);

      expect(service.remove).toHaveBeenCalledWith(mockProject.id, mockTenantId);
    });
  });
});
