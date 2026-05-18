// backend/src/services/notifySubscribers.service.js

import { prisma } from "../lib/prisma.js";
import { sendNewPostEmail } from "./email.service.js";

export async function notifyBlogSubscribers(post) {
  console.log("notifyBlogSubscribers called");
  console.log("Post:", post.title);

  const blogId = post.blogProfileId || post.blogProfile?.id;

  if (!blogId) {
    console.log("No blogProfileId found on post. Cannot notify subscribers.");
    return;
  }

  const blog =
    post.blogProfile ||
    (await prisma.blogProfile.findUnique({
      where: { id: blogId },
    }));

  if (!blog) {
    console.log("Blog profile not found for:", blogId);
    return;
  }

  const subscribers = await prisma.blogSubscription.findMany({
    where: {
      blogId,
      active: true,
    },
  });

  console.log("Subscribers found:", subscribers.length);

  for (const sub of subscribers) {
    console.log("Sending email to:", sub.email);

    await sendNewPostEmail({
      to: sub.email,
      post,
      blog,
    });

    console.log("Email sent to:", sub.email);
  }
}