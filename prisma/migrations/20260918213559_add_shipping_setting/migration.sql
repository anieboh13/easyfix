-- CreateTable
CREATE TABLE "ShippingSetting" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "type" TEXT NOT NULL DEFAULT 'fixed',
    "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingSetting_pkey" PRIMARY KEY ("id")
);
