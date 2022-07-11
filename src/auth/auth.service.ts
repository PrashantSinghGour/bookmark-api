/* eslint-disable prettier/prettier */

import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
@Injectable({})
export class AuthService {

  constructor(private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService) { }

  async login(dto: AuthDto) {

    //find user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email
      }
    })
    //if user doesn't exists throw error
    if (!user) {
      throw new ForbiddenException('Credentials incorrect!');
    }

    //compare password
    const pwMatches = await argon.verify(user.hash, dto.password);
    //if password incorrect throw exception
    if (!pwMatches) {
      throw new ForbiddenException('Credentials incorrect!');
    }

    //send jwt
    return this.signToken(user.id, user.email);
  }

  async signUp(dto: AuthDto) {
    // generate the password hash
    const hash = await argon.hash(dto.password);

    //save new user in db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash
        },
        // select: {  // to define the data to be return from created data
        //   email: true,
        //   createdAt: true,
        //   id: true
        // }
      });
      //send jwt
      return this.signToken(user.id, user.email);
    }
    catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') { // when we are trying to create same data which is unique
          throw new ForbiddenException('Credentials Taken!')
        }
      } else throw error;
    }
  }

  async signToken(userId: number, email: string): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email
    }
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get('JWT_SECRET')
    });
    return {
      access_token: token
    }
  }
}
