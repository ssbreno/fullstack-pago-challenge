import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Full Stack Pago Challenge API')
    .setDescription(`
      # Introduction
      This is the API documentation for the Full Stack Pago Challenge platform.
      
      # Authentication
      All authenticated endpoints require a Bearer token in the Authorization header.
      
      # Error Handling
      The API uses standard HTTP status codes and returns error responses in a consistent format:
      \`\`\`json
      {
        "statusCode": 400,
        "message": "Error message here",
        "error": "Error type"
      }
      \`\`\`
      
      # Rate Limiting
      API requests are limited to 100 requests per minute per IP address.
    `)
    .setVersion('1.0')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3001', 'Local Development')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });

  SwaggerModule.setup('api/docs', app, document, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      filter: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3,
      showExtensions: true,
      tryItOutEnabled: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
    },
    customSiteTitle: 'Full Stack Pago Challenge API Documentation',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .information-container { padding: 20px }
      .swagger-ui .scheme-container { padding: 20px }
      .swagger-ui .markdown p, .swagger-ui .markdown pre, 
      .swagger-ui .renderedMarkdown p, .swagger-ui .renderedMarkdown pre {
        margin: 1em 0;
      }
      .swagger-ui table tbody tr td {
        padding: 10px;
        vertical-align: top;
      }
      .swagger-ui .response-col_description {
        padding-bottom: 10px;
      }
      .swagger-ui .opblock-description-wrapper p {
        font-size: 14px;
      }
    `,
    customJs: '/custom-swagger.js',
  });
}