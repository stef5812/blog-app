CREATE TABLE IF NOT EXISTS "BlogSubscription" (
  "id" TEXT NOT NULL,
  "authUserId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "blogId" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "BlogSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BlogSubscription_authUserId_blogId_key"
ON "BlogSubscription"("authUserId", "blogId");

ALTER TABLE "BlogSubscription"
ADD CONSTRAINT "BlogSubscription_blogId_fkey"
FOREIGN KEY ("blogId") REFERENCES "BlogProfile"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
