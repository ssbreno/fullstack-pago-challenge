# Fullstack Challenge - Image Storage & Display

Um aplicativo fullstack para upload, compressão e exibição de imagens com otimização de performance através de caching.

## Estrutura do Projeto

```
fullstack-pago-challenge/
├── backend/            # Aplicação backend em NestJS
│   ├── src/
│   │   ├── common/     # Configurações, exceções e interceptors compartilhados
│   │   ├── infrastructure/ # Integração com serviços externos (AWS S3)
│   │   └── modules/    # Módulos da aplicação (imagem)
│   └── ...
├── frontend/           # Aplicação frontend em React/Vite
│   ├── src/
│   │   ├── assets/     # Recursos estáticos
│   │   ├── config/     # Configurações
│   │   ├── hooks/      # Custom hooks
│   │   └── ...
└── scripts/            # Scripts utilitários
```

## Tecnologias Utilizadas

### Backend
- **Framework**: NestJS
- **Linguagem**: TypeScript
- **Storage**: AWS S3 (LocalStack para ambiente de desenvolvimento)
- **Cache**: NestJS Cache Manager
- **Processamento de Imagens**: Sharp
- **Documentação**: Swagger/OpenAPI
- **Logging**: Winston

### Frontend
- **Framework**: React
- **Linguagem**: TypeScript
- **Build Tool**: Vite
- **UI/UX**: Interface de usuário com design moderno
- **Testes**: Vitest, Testing Library
- **Documentação de componentes**: Storybook

## Funcionalidades Principais

1. **Upload de Imagens**
   - Validação de tipo e tamanho
   - Compressão automática e otimização de imagens
   - Armazenamento em S3

2. **Gerenciamento de Cache**
   - Cache em memória para imagens acessadas frequentemente
   - TTL (Time To Live) configurável

3. **Otimização de Imagens**
   - Redimensionamento automático para largura máxima de 1920px
   - Compressão JPEG, PNG e WebP com configurações otimizadas

4. **Interface Responsiva**
   - Suporte a diferentes dispositivos e tamanhos de tela

## Configuração e Execução

### Requisitos
- Node.js v18+
- Docker e Docker Compose (para LocalStack)
- MongoDB (ou container)

### Backend

1. Navegue até o diretório do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o LocalStack (S3 local):
```bash
docker-compose up -d
```

4. Execute o backend em modo de desenvolvimento:
```bash
npm run start:dev
```

O servidor estará disponível em http://localhost:3000.

### Frontend

1. Navegue até o diretório do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o frontend em modo de desenvolvimento:
```bash
npm run dev
```

A interface será acessível em http://localhost:5173.

## API Endpoints

### Imagens
- `POST /upload/image` - Upload de imagem (multipart/form-data)
- `GET /static/image/:filename` - Recuperar imagem por nome de arquivo

## Detalhes Técnicos

### Cache
O serviço utiliza cache para otimizar o acesso às imagens mais requisitadas.
Quando uma imagem é carregada do S3, ela é armazenada em cache por 60 segundos.

### Processamento de Imagens
As imagens são automaticamente processadas pelo Sharp:
- JPG/JPEG: Qualidade 80%
- PNG: Nível de compressão 8
- WebP: Qualidade 80%
- Imagens maiores que 1920px de largura são redimensionadas

### Armazenamento
As imagens são armazenadas no S3 com nomes de arquivo únicos baseados em timestamp.

## Desenvolvimento

### Backend
- Executar testes: `npm test`
- Documentação da API: Acesse `/api` após iniciar o servidor

### Frontend
- Executar testes: `npm test`
- Storybook: `npm run storybook`

## Arquitetura

### Backend
O backend segue uma arquitetura modular baseada em princípios de Domain-Driven Design (DDD):

- **Presentations Layer**: Controllers, DTOs e validação de entrada
- **Application Layer**: Serviços de aplicação
- **Infrastructure Layer**: Integrações externas como S3
