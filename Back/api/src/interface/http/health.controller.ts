import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      service: 'mind-shelter-api',
      timestamp: new Date().toISOString(),
    };
  }
}
