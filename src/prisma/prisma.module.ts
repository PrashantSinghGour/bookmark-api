/* eslint-disable prettier/prettier */
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // to make the service available throughout the app. 
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule { }
