import { User } from '../../domain/entities/user.entity';

export const toUserResponse = (user: User) => ({
  id: user.id,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
