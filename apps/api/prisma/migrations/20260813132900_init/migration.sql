-- CreateTable
CREATE TABLE "User" (
    "id" BIGSERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceProduct" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "category" VARCHAR(20) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "institution" VARCHAR(100) NOT NULL,
    "startDate" DATE NOT NULL,
    "maturityDate" DATE NOT NULL,
    "monthlyPayment" INTEGER NOT NULL,
    "coverageAmount" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "InsuranceProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" BIGSERIAL NOT NULL,
    "productId" BIGINT NOT NULL,
    "type" VARCHAR(10) NOT NULL,
    "channel" VARCHAR(20) NOT NULL,
    "sentAt" TIMESTAMP(6) NOT NULL,
    "status" VARCHAR(20) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" BIGSERIAL NOT NULL,
    "productId" BIGINT NOT NULL,
    "fileUrl" VARCHAR(500) NOT NULL,
    "ocrText" TEXT,
    "parsedData" JSONB,
    "uploadedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InsuranceProduct" ADD CONSTRAINT "InsuranceProduct_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_productId_fkey" FOREIGN KEY ("productId") REFERENCES "InsuranceProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_productId_fkey" FOREIGN KEY ("productId") REFERENCES "InsuranceProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
