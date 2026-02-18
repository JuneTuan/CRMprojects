// server/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeSampleData } from './storage/init-data';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 添加全局API前缀
  app.setGlobalPrefix('api');
  
  // 初始化示例数据
  initializeSampleData();
  
  // 配置CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  await app.listen(3001);
  console.log('Server is running on http://localhost:3001');
}
bootstrap();