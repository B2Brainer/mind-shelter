import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(email: string, password: string): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email,
        password,
      },
    });

    return new User(user.id, user.email, user.password, user.createdAt, user.updatedAt);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return new User(user.id, user.email, user.password, user.createdAt, user.updatedAt);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return new User(user.id, user.email, user.password, user.createdAt, user.updatedAt);
  }
}
