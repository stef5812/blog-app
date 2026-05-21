-- CreateEnum
CREATE TYPE "TravelMode" AS ENUM ('FOOT', 'BIKE', 'CAR', 'TRAIN', 'BUS', 'PLANE', 'OTHER');

-- CreateEnum
CREATE TYPE "TravelGroup" AS ENUM ('ALONE', 'FRIEND', 'PARTNER', 'GROUP');

-- CreateTable
CREATE TABLE "BlogWaypoint" (
    "id" TEXT NOT NULL,
    "blogProfileId" TEXT NOT NULL,
    "title" TEXT,
    "fromName" TEXT NOT NULL,
    "fromLat" DOUBLE PRECISION NOT NULL,
    "fromLng" DOUBLE PRECISION NOT NULL,
    "toName" TEXT NOT NULL,
    "toLat" DOUBLE PRECISION NOT NULL,
    "toLng" DOUBLE PRECISION NOT NULL,
    "travelMode" "TravelMode" NOT NULL,
    "customMode" TEXT,
    "travelGroup" "TravelGroup" NOT NULL,
    "startedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogWaypoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogWaypointPost" (
    "id" TEXT NOT NULL,
    "waypointId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "BlogWaypointPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlogWaypointPost_waypointId_postId_key" ON "BlogWaypointPost"("waypointId", "postId");

-- AddForeignKey
ALTER TABLE "BlogWaypoint" ADD CONSTRAINT "BlogWaypoint_blogProfileId_fkey" FOREIGN KEY ("blogProfileId") REFERENCES "BlogProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogWaypointPost" ADD CONSTRAINT "BlogWaypointPost_waypointId_fkey" FOREIGN KEY ("waypointId") REFERENCES "BlogWaypoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogWaypointPost" ADD CONSTRAINT "BlogWaypointPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

