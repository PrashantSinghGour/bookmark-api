import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
describe('App e2e', () => {
  let app: INestApplication;
  // provides hook
  beforeAll(async () => {
    // create a testing module
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleRef.createNestApplication();

    // need to do this to dtos to work while test
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();
  });

  // once our all tests are done, lets close the app
  afterAll(() => {
    app && app.close();
  });

  it.todo('should pass!');
});
