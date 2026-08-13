import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({
    summary: '서버 헬스 체크',
    description: '서버가 정상적으로 켜져 있는지 확인합니다.',
  })
  @ApiResponse({ status: 200, description: '정상 동작 중' })
  getHealth(): string {
    return 'Boim API Server is running!';
  }
}
