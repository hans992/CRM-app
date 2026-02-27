import { PrismaClient } from "@prisma/client";
import { runSeed } from "../src/lib/seed";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const usersToCreate = [
    { email: "demo@example.com", name: "Demo User", role: "SALES_REP" as const },
    { email: "alex.chen@example.com", name: "Alex Chen", role: "ADMIN" as const },
    { email: "jordan.smith@example.com", name: "Jordan Smith", role: "MANAGER" as const },
    { email: "sam.williams@example.com", name: "Sam Williams", role: "SALES_REP" as const },
    { email: "riley.jones@example.com", name: "Riley Jones", role: "SALES_REP" as const },
  ];

  const userIds: string[] = [];

  for (const u of usersToCreate) {
    const existing = await prisma.user.findFirst({ where: { email: u.email } });
    if (existing) {
      userIds.push(existing.id);
    } else {
      const created = await prisma.user.create({
        data: { email: u.email, name: u.name, role: u.role },
      });
      userIds.push(created.id);
    }
  }

  const result = await runSeed(userIds);
  if (!result.success) {
    throw new Error(result.error);
  }
  console.log("Created " + result.count + " deals with notes.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
