import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as compression from 'compression';
import helmet from 'helmet';
import { CustomLogger } from './common/logging/logger.service';
import { setupSwagger } from './common/config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new CustomLogger(),
  });

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          styleSrc: [`'self'`, `'unsafe-inline'`],
          imgSrc: [`'self'`, 'data:', 'https:'],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`, `'unsafe-eval'`],
        },
      },
    }),
  );

  app.enableCors({
    origin: ['http://localhost:3002'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  app.use(compression());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  setupSwagger(app);

  app.setGlobalPrefix('/api/v1');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  app
    .get(CustomLogger)
    .log(`Application is running on: http://localhost:${port}`, 'Bootstrap');
}

bootstrap();
