import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import appConfig from './config/app.config';
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';

const excludedPaths = [
  { path: '/', method: RequestMethod.GET },
  { path: '/error', method: RequestMethod.GET },
  { path: '/logs', method: RequestMethod.GET },
];

async function bootstrap() {
  const logger = new Logger();
  const { port } = appConfig();
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('api', {
    exclude: excludedPaths,
  });
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      disableErrorMessages: false,
      forbidNonWhitelisted: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('AIC API DOCS')
    .setDescription('AIC API description')
    .setVersion('1.0')
    .addTag('AIC')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(port);
  logger.log(`Application running on port ${port}`);
}
bootstrap();
