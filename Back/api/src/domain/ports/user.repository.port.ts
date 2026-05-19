import { User } from '../entities/user.entity';

export interface UserRepositoryPort {
  create(email: string, password: string): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}
