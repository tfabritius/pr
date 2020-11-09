import { createApp } from './app.factory'

async function bootstrap() {
  const app = await createApp()

  await app.listen(3000)
}
bootstrap()
