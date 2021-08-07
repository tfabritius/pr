import { NestFactory, Reflector } from '@nestjs/core'
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { Test, TestingModule } from '@nestjs/testing'
import * as helmet from 'helmet'

import { AppModule } from './app.module'

export async function createApp(
  environment: 'prod' | 'test' = 'prod',
): Promise<INestApplication> {
  let app: NestExpressApplication

  if (environment === 'prod') {
    app = await NestFactory.create<NestExpressApplication>(AppModule)
    if (process.env.SERVE_STATIC_PATH) {
      app.setGlobalPrefix('api')
    }
  } else {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
  }

  /**
   * Activate security measures
   * - disable CSP during development for GraphQL playground
   */
  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === 'development' ? false : undefined,
    }),
  )

  /* Validate input and remove unknown properties */
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )

  /* Add OpenAPI */
  const options = new DocumentBuilder()
    .setTitle('Portfolio Report API')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, options)
  const swaggerPath = process.env.SERVE_STATIC_PATH ? 'api/doc' : 'doc'
  SwaggerModule.setup(swaggerPath, app, document)

  /* Allow cross-origin requests */
  app.enableCors()

  /* Trust reverse proxy, e.g. use IP address from X-Forwarded-For */
  app.set('trust proxy', 1)

  return app
}
