import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  /* Validate input and remove unknown properties */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  )

  /* Use class-transformer on output objects */
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

  /* Add OpenAPI */
  const options = new DocumentBuilder()
    .setTitle('Portfolio Report API')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('doc', app, document)

  await app.listen(3000)
}
bootstrap()
