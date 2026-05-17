import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendNewPostEmail({ to, post, blog }) {
  const url = `https://stefandodds.ie/blog-app/${blog.username}/${post.slug}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `New post: ${post.title}`,
    text: `A new post has been published on ${blog.title || blog.username}.\n\n${post.title}\n\nRead it here:\n${url}`,
  });
}