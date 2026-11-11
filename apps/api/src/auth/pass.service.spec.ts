import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PassService, PASS_TTL_MS } from './pass.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PassService', () => {
  let service: PassService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PassService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              update: jest
                .fn()
                .mockResolvedValue({ id: BigInt(1), isPassVerified: true }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PassService>(PassService);
    prismaService = module.get<PrismaService>(PrismaService);
    service.clearSessions();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('requestMockVerification', () => {
    it('유효한 휴대폰 번호 입력 시 PASS_TX_ 접두사를 가진 트랜잭션 ID를 반환해야 한다', async () => {
      const transactionId =
        await service.requestMockVerification('01012345678');
      expect(transactionId).toContain('PASS_TX_');

      const session = service.getSession(transactionId);
      expect(session).toBeDefined();
      expect(session?.code).toMatch(/^\d{6}$/);
      expect(session?.phoneNumber).toBe('01012345678');
      expect(session?.expiresAt).toBeGreaterThan(Date.now());
    });

    it('30초 이내에 동일 번호로 재요청 시 쿨다운 에러를 발생시켜야 한다', async () => {
      await service.requestMockVerification('01099998888');

      await expect(
        service.requestMockVerification('01099998888'),
      ).rejects.toThrow(BadRequestException);
    });

    it('잘못된 형식의 전화번호일 경우 에러를 발생시켜야 한다', async () => {
      await expect(service.requestMockVerification('123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('verifyMockCode', () => {
    it('발급된 세션의 실제 6자리 난수 코드로 검증 시 성공하고 세션이 일회용으로 파기되어야 한다', async () => {
      const txId = await service.requestMockVerification('01011112222');
      const session = service.getSession(txId);
      expect(session).toBeDefined();

      const generatedCode = session!.code;

      const result = await service.verifyMockCode(txId, generatedCode, '1');
      expect(result).toEqual({ message: 'PASS 본인인증이 완료되었습니다.' });
      expect(prismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: BigInt(1) },
          data: expect.objectContaining({ isPassVerified: true }),
        }),
      );

      // 1회용 파기 확인: 동일 txId로 다시 검증 시도 시 세션 없음 에러
      await expect(
        service.verifyMockCode(txId, generatedCode, '1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('개발/테스트 슈퍼코드(000000) 검증을 지원해야 한다', async () => {
      const txId = await service.requestMockVerification('01033334444');
      const result = await service.verifyMockCode(txId, '000000');
      expect(result).toEqual({ message: 'PASS 본인인증이 완료되었습니다.' });
    });

    it('인증 유효시간(3분)이 경과한 경우 만료 에러를 발생시켜야 한다', async () => {
      const txId = 'PASS_TX_EXPIRED';
      const expiredSession = {
        code: '654321',
        phoneNumber: '01055556666',
        createdAt: Date.now() - (PASS_TTL_MS + 1000),
        expiresAt: Date.now() - 1000, // 1초 전 만료
      };
      service.setSession(txId, expiredSession);

      await expect(service.verifyMockCode(txId, '654321')).rejects.toThrow(
        '인증 유효시간(3분)이 만료되었습니다. 인증번호를 다시 요청해주세요.',
      );
    });

    it('존재하지 않는 트랜잭션 ID로 요청 시 에러를 발생시켜야 한다', async () => {
      await expect(
        service.verifyMockCode('NON_EXISTENT_TX', '123456'),
      ).rejects.toThrow(
        '유효하지 않거나 이미 만료된 인증 요청입니다. 인증번호를 다시 요청해주세요.',
      );
    });

    it('인증번호가 일치하지 않을 경우 에러를 발생시켜야 한다', async () => {
      const txId = await service.requestMockVerification('01077778888');
      await expect(service.verifyMockCode(txId, '999999')).rejects.toThrow(
        '인증번호가 일치하지 않습니다.',
      );
    });
  });
});
