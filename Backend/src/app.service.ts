import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Test } from 'generated/prisma';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async checkHealth(): Promise<Test> {
    const data = await this.prisma.test.create({
      data: {
        test: 'aaaaaaaaa',
      },
    });

    return data;
  }
}
