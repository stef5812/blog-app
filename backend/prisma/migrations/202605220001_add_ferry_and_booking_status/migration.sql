-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('BOOKED', 'NOT_BOOKED');

-- AlterEnum
ALTER TYPE "TravelMode" ADD VALUE 'FERRY';

-- AlterTable
ALTER TABLE "BlogWaypoint" ADD COLUMN     "bookingStatus" "BookingStatus" NOT NULL DEFAULT 'BOOKED';

