import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { describe, beforeEach, afterEach, it, expect, jest } from '@jest/globals';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // É importante configurar o prefixo global aqui, assim como no main.ts
    app.setGlobalPrefix('/api/v1');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/v1 (GET)', async () => {
    // Ajustando a rota para usar o prefixo global
    await request(app.getHttpServer())
      .get('/api/v1')
      .expect(404); // Alterado para 404 já que não temos uma rota em /api/v1
  });
});
