import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 启用全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (errors) => {
      console.log('=== 验证错误 ===');
      console.log('错误详情:', JSON.stringify(errors, null, 2));
      return errors;
    },
  }));
  
  // 启用CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // 设置JSON序列化选项，确保中文字符不被转义
  app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
  });
  
  // 覆盖默认的JSON序列化
  app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function(data) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.send(JSON.stringify(data, null, 2));
      return this;
    };
    next();
  });
  
  await app.listen(3001);
  console.log('Application is running on: http://localhost:3001');
}
bootstrap();