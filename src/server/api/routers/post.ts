import { TRPCError } from "@trpc/server";
import { privateProcedure, createTRPCRouter } from "../trpc";
import { z } from "zod";

export const postRouter = createTRPCRouter({
  create: privateProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        latitude: z.number(),
        longitude: z.number(),
        tokenWorth: z.number(),
        userId: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      let userFound = await ctx.prisma.user.findUnique({
        where: {
          userId: input.userId,
        },
      });

      if (!userFound) {
        userFound = await ctx.prisma.user.create({
          data: {
            userId: input.userId,
            tokens: 0,
          },
        });
      }

      await ctx.prisma.post.create({
        data: {
          title: input.title,
          content: input.content,
          latitude: input.latitude,
          longitude: input.longitude,
          authorId: userFound.id,
          tokenWorth: input.tokenWorth,
        },
      });
    }),

  take: privateProcedure
    .input(
      z.object({
        postId: z.string().min(1),
        userId: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const post = await ctx.prisma.post.findUnique({
        where: {
          id: input.postId,
        },
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      await ctx.prisma.post.delete({
        where: {
          id: input.postId,
        },
      });

      let userFound = await ctx.prisma.user.findUnique({
        where: {
          userId: input.userId,
        },
      });

      if (!userFound) {
        userFound = await ctx.prisma.user.create({
          data: {
            userId: input.userId,
            tokens: 0,
          },
        });
      }

      await ctx.prisma.user.update({
        where: {
          userId: input.userId,
        },
        data: {
          tokens: userFound.tokens + post.tokenWorth,
        },
      });
    }),

  get: privateProcedure.query(({ ctx }) => {
    return ctx.prisma.post.findMany();
  }),

  tokens: privateProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const userFound = await ctx.prisma.user.findUnique({
        where: {
          userId: input.userId,
        },
      });

      if (!userFound) {
        return 0;
      }

      return userFound.tokens;
    }),
});
