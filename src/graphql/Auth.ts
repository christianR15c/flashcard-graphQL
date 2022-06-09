import { objectType, extendType, nonNull, stringArg } from 'nexus';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { APP_SECRET } from '../utils/auth';

export const AuthPayload = objectType({
  name: 'AuthPayload',
  definition(t) {
    t.nonNull.string('token');
    t.nonNull.field('user', { type: 'User' });
  },
});

export const AuthMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('signup', {
      type: AuthPayload,
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
        name: nonNull(stringArg()),
      },
      resolve: async (parent, { email, password, name }, context) => {
        const passwordHash = await bcrypt.hash(password, 12);
        const user = await context.prisma.user.create({
          data: { email, password: passwordHash, name },
        });
        const token = jwt.sign({ userId: user.id }, APP_SECRET);
        return { token, user };
      },
    });

    t.nonNull.field('signin', {
      type: AuthPayload,
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      resolve: async (parent, { email, password }, context) => {
        const user = await context.prisma.user.findUnique({ where: { email } });
        if (!user) {
          throw new Error(`No user found for email: ${email}`);
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          throw new Error('Invalid password');
        }
        const token = jwt.sign({ userId: user.id }, APP_SECRET);
        return { token, user };
      },
    });
  },
});
