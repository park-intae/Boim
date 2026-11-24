import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import request from 'supertest';
import { InsuranceProductController } from '../../insurance-product/insurance-product.controller';
import { InsuranceProductService } from '../../insurance-product/insurance-product.service';
import { UserController } from '../../user/user.controller';
import { UserService } from '../../user/user.service';
import { NotificationController } from '../../notification/notification.controller';
import { NotificationService } from '../../notification/notification.service';
import { NotificationSchedulerService } from '../../notification/notification-scheduler.service';
import { AnalysisController } from '../../analysis/analysis.controller';
import { AiDiagnosisService } from '../../analysis/ai-diagnosis.service';
import { ExportService } from '../../analysis/export.service';
import { JwtStrategy } from '../../auth/jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { TransformInterceptor } from '../interceptors/transform.interceptor';
import { getJwtSecret } from '../config/env.validation';

describe('JWT AuthGuard & Row-Level Ownership Integration (HTTP)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockPrisma = {
    insuranceProduct: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest
        .fn()
        .mockResolvedValue({ id: 1n, email: 'user1@boim.com', name: '유저1' }),
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({
          secret: getJwtSecret(),
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [
        InsuranceProductController,
        UserController,
        NotificationController,
        AnalysisController,
      ],
      providers: [
        JwtStrategy,
        InsuranceProductService,
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: UserService,
          useValue: {
            getUserById: jest
              .fn()
              .mockResolvedValue({ id: 1n, email: 'user1@boim.com' }),
          },
        },
        {
          provide: NotificationService,
          useValue: { findAll: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: NotificationSchedulerService,
          useValue: { runBatch: jest.fn() },
        },
        {
          provide: AiDiagnosisService,
          useValue: { diagnoseUserInsurances: jest.fn().mockResolvedValue({}) },
        },
        {
          provide: ExportService,
          useValue: {
            generateExcelReport: jest.fn().mockResolvedValue(Buffer.from('')),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('토큰 없이 보호된 엔드포인트 접근 시 실제 HTTP 401을 반환해야 한다', async () => {
    const server = app.getHttpServer();
    await request(server).get('/insurance-products').expect(401);
    await request(server).get('/users/me').expect(401);
    await request(server).get('/notifications').expect(401);
    await request(server).get('/analysis/ai-diagnosis').expect(401);
  });

  it('위조된 JWT 토큰으로 접근 시 실제 HTTP 401을 반환해야 한다', async () => {
    const server = app.getHttpServer();
    await request(server)
      .get('/insurance-products')
      .set('Authorization', 'Bearer tampered.jwt.token')
      .expect(401);
  });

  it('유효한 JWT 토큰이라도 타인 소유 보험 상품 조회 시 실제 HTTP 403을 반환해야 한다', async () => {
    const token = jwtService.sign({ sub: '1', email: 'user1@boim.com' });
    mockPrisma.insuranceProduct.findUnique.mockResolvedValueOnce({
      id: 99n,
      userId: 2n, // 타인 소유
      name: '타인 보험',
    });

    const server = app.getHttpServer();
    await request(server)
      .get('/insurance-products/99')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});
