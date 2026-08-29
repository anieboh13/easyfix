-- CreateTable
CREATE TABLE "OrderIntent" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "productTitle" TEXT NOT NULL,
    "variantId" TEXT,
    "variantLabel" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "affiliateLink" TEXT,
    "sourceUrl" TEXT,
    "aliexpressSkuId" TEXT,
    "whatsappNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderIntent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrderIntent" ADD CONSTRAINT "OrderIntent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
