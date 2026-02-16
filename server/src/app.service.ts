import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello CRM System!';
  }

  getHealth(): string {
    return 'Service is healthy';
  }
}