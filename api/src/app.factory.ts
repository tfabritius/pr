import { NestFactory, Reflector } from '@nestjs/core'
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { Test, TestingModule } from '@nestjs/testing'
import * as helmet from 'helmet'

import { AppModule } from './app.module'

export async function createApp(
  environment: 'prod' | 'test' = 'prod',
): Promise<INestApplication> {
  let app: INestApplication

  if (environment === 'prod') {
    app = await NestFactory.create(AppModule)
    if (process.env.SERVE_STATIC === 'true') {
      app.setGlobalPrefix('api')
    }
  } else {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
  }

  /* Activate security measures */
  app.use(helmet())

  /* Validate input and remove unknown properties */
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )

  /* Use class-transformer on output objects */
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

  /* Add OpenAPI */
  const options = new DocumentBuilder()
    .setTitle('Portfolio Report API')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('doc', app, document)

  /* Allow cross-origin requests */
  app.enableCors()

  return app
}
