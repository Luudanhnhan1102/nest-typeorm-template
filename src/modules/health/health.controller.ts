import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicEndpoint } from '../auth/decorators/publicEndpoint';

@Controller('health')
@ApiTags('health')
export class HealthController {
  @Get()
  @ApiOperation({
    operationId: 'health',
    summary: 'Health check',
  })
  @PublicEndpoint()
  healthCheck() {
    return 'OK';
  }
}
