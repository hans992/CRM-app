import { PrismaClient } from "@prisma/client";
import { runSeed } from "../src/lib/seed";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create a default user if it doesn't exist
  let defaultUser = await prisma.user.findFirst({
    where: { email: "demo@example.com" },
  });

  if (!defaultUser) {
    defaultUser = await prisma.user.create({
      data: {
        email: "demo@example.com",
        name: "Demo User",
        role: "SALES_REP",
      },
    });
  }

  const result = await runSeed();
  if (!result.success) {
    throw new Error(result.error);
  }
  console.log(`✅ Created ${result.count} deals`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
