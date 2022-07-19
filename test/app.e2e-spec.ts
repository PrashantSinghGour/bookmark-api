import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { EditUserDto } from '../src/user/dto';
import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto';

import { PrismaService } from '../src/prisma/prisma.service';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    // Need to do this to dtos to work
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    // initialize app context
    await app.init();

    // initialise server at port 3333
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'test@test.com',
      password: 'test-123',
    };
    describe('Signup', () => {
      it('Should throw error on empty email', () => {
        return pactum
          .spec()
          .post('/auth/signUp')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('Should throw error on empty password', () => {
        return pactum
          .spec()
          .post('/auth/signUp')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('Should throw error if no body provided', () => {
        return pactum.spec().post('/auth/signUp').expectStatus(400);
      });
      it('Should signup', () => {
        return pactum
          .spec()
          .post('/auth/signUp')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Signin', () => {
      it('Should throw error on empty email', () => {
        return pactum
          .spec()
          .post('/auth/signIn')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('Should throw error on empty password', () => {
        return pactum
          .spec()
          .post('/auth/signIn')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('Should throw error if no body provided', () => {
        return pactum.spec().post('/auth/signIn').expectStatus(400);
      });
      it('Should Signin', () => {
        return pactum
          .spec()
          .post('/auth/signIn')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('It should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({ Authorization: `Bearer $S{userAt}` })
          .expectStatus(200);
      });
    });
    describe('Edit user', () => {
      const dto: EditUserDto = {
        firstName: 'Prashant',
        email: 'prashant@e2e-test.com',
      };
      it('It should edit user', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({ Authorization: `Bearer $S{userAt}` })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.email)
          .expectBodyContains(dto.firstName);
      });
    });
  });
  // describe('Bookmarks', () => {
  //   describe('Create bookmark', () => { });
  //   describe('Get bookmarks', () => { });
  //   describe('Get bookmark by id', () => { });
  //   describe('Edit bookmark', () => { });
  //   describe('Delete bookmark', () => { });
  // });
});
