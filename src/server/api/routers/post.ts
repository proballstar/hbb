import { TRPCError } from "@trpc/server";
import { privateProcedure, createTRPCRouter } from "../trpc";
import { z } from "zod";
import { uploadImage } from "../../../utils/uploadImage";

export const postRouter = createTRPCRouter({
  create: privateProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        latitude: z.number(),
        longitude: z.number(),
        tokenWorth: z.number(),
        image: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const imageOutput = await uploadImage(input.image);

      ctx.prisma.post.create({
        data: {
          title: input.title,
          content: input.content,
          latitude: input.latitude,
          longitude: input.longitude,
          authorId: ctx.user.userId!,
          tokenWorth: input.tokenWorth,
          image: imageOutput.data.url,
        },
      });
    }),

  take: privateProcedure
    .input(
      z.object({
        postId: z.string().min(1),
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
          id: ctx.user.userId!,
        },
      });

      if (!userFound) {
        userFound = await ctx.prisma.user.create({
          data: {
            id: ctx.user.userId!,
            tokens: 0,
          },
        });
      }

      await ctx.prisma.user.update({
        where: {
          id: ctx.user.userId!,
        },
        data: {
          tokens: userFound.tokens + post!.tokenWorth,
        },
      });
    }),

  get: privateProcedure.query(({ ctx }) => {
    return ctx.prisma.post.findMany();
  }),
});
