-- AlterTable
ALTER TABLE "Log" ADD COLUMN     "configurationId" TEXT;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_configurationId_fkey" FOREIGN KEY ("configurationId") REFERENCES "AIConfiguration"("id") ON DELETE SET NULL ON UPDATE CASCADE;
