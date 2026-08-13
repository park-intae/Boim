import { ApiProperty } from '@nestjs/swagger';
import { CreateInsuranceProductDto as SharedCreateDto } from '@boim/shared-types';

export class CreateInsuranceProductDto implements SharedCreateDto {
  @ApiProperty({ description: '사용자 ID (추후 JWT 인증 도입 시 제거될 수 있음)' })
  userId!: number;

  @ApiProperty({ description: '보험 카테고리 (예: 생명보험, 실비보험 등)' })
  category!: string;

  @ApiProperty({ description: '보험 상품명' })
  name!: string;

  @ApiProperty({ description: '보험사/기관명' })
  institution!: string;

  @ApiProperty({ description: '가입 시작일 (YYYY-MM-DD)' })
  startDate!: string;

  @ApiProperty({ description: '만기일 (YYYY-MM-DD)' })
  maturityDate!: string;

  @ApiProperty({ description: '월 납입액' })
  monthlyPayment!: number;

  @ApiProperty({ description: '보장 총액' })
  coverageAmount!: number;
}
