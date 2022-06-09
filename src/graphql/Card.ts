import {
  objectType,
  extendType,
  nonNull,
  stringArg,
  intArg,
  idArg,
} from 'nexus';

export const Card = objectType({
  name: 'Card',
  definition(t) {
    t.nonNull.int('id');
    t.nonNull.string('question');
    t.nonNull.string('answer');
  },
});

export const CardQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('allCards', {
      type: 'Card',
      resolve(parent, args, context, info) {
        return context.prisma.card.findMany();
      },
    });
  },
});

export const CardMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('createCard', {
      type: 'Card',
      args: {
        question: nonNull(stringArg()),
        answer: nonNull(stringArg()),
      },
      resolve(parent, args, context, info) {
        if (!context.userId) {
          throw new Error('You can not create a card without being logged in');
        }
        const newCard = context.prisma.card.create({
          data: {
            question: args.question,
            answer: args.answer,
          },
        });
        return newCard;
      },
    });

    // get card by id
    t.field('getCard', {
      type: 'Card',
      args: {
        id: nonNull(intArg()),
      },
      resolve(parent, args, context, info) {
        return context.prisma.card.findUnique({
          where: {
            id: args.id,
          },
        });
      },
    });

    // update card by id
    t.field('updateCard', {
      type: 'Card',
      args: {
        id: nonNull(intArg()),
        question: nonNull(stringArg()),
        answer: nonNull(stringArg()),
      },
      resolve(parent, args, context, info) {
        return context.prisma.card.update({
          where: {
            id: args.id,
          },
          data: {
            question: args.question,
            answer: args.answer,
          },
        });
      },
    });

    // delete card by id
    t.field('deleteCard', {
      type: 'Card',
      args: {
        id: nonNull(intArg()),
      },
      resolve(parent, args, context, info) {
        return context.prisma.card.delete({
          where: {
            id: args.id,
          },
        });
      },
    });
  },
});
