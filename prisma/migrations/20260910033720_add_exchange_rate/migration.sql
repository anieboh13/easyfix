-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "rate" DOUBLE PRECISION NOT NULL,
    "bufferPct" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "source" TEXT NOT NULL DEFAULT 'default',
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);
