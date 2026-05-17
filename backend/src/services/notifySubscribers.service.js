import { prisma } from "../lib/prisma.js";
import { sendNewPostEmail } from "./email.service.js";

export async function notifyBlogSubscribers(post) {
  const blog = await prisma.blog.findUnique({
    where: { id: post.blogId },
  });

  if (!blog) return;

  const subscribers = await prisma.blogSubscription.findMany({
    where: {
      blogId: post.blogId,
      active: true,
    },
  });

  for (const sub of subscribers) {
    await sendNewPostEmail({
      to: sub.email,
      post,
      blog,
    });
  }
}