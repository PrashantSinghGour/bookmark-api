import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //to allow pipe globally
  app.useGlobalPipes(new ValidationPipe({ whitelist: true })); //whitelist strip out the unknown data if passed other than dto
  await app.listen(3000);
}
bootstrap();
