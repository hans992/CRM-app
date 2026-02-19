import { PrismaClient } from "@prisma/client";

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

  // Clear existing deals
  await prisma.deal.deleteMany({});

  const stages = ["Closed Won", "Negotiating", "Lost", "Prospecting", "Qualified"];
  const dealNames = [
    "Enterprise Software License",
    "Cloud Infrastructure Contract",
    "Marketing Automation Platform",
    "CRM Implementation",
    "Data Analytics Suite",
    "Security Compliance Package",
    "Customer Support Tools",
    "E-commerce Integration",
    "Mobile App Development",
    "API Integration Services",
    "Content Management System",
    "Business Intelligence Dashboard",
    "Email Marketing Platform",
    "Project Management Tools",
    "HR Management System",
    "Financial Software License",
    "Inventory Management",
    "Supply Chain Solution",
    "Customer Portal Development",
    "AI Chatbot Implementation",
  ];

  const deals = [];
  const now = new Date();

  for (let i = 0; i < 20; i++) {
    // Spread dates across last 3 months
    const monthsAgo = Math.floor(Math.random() * 3);
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date(now);
    createdAt.setMonth(now.getMonth() - monthsAgo);
    createdAt.setDate(now.getDate() - daysAgo);
    createdAt.setHours(Math.floor(Math.random() * 24));
    createdAt.setMinutes(Math.floor(Math.random() * 60));

    // Random value between $1,000 and $10,000
    const value = Math.floor(Math.random() * 9000) + 1000;

    // Weighted stage distribution (more "Closed Won" and "Negotiating")
    let stage;
    const rand = Math.random();
    if (rand < 0.3) stage = "Closed Won";
    else if (rand < 0.6) stage = "Negotiating";
    else if (rand < 0.75) stage = "Prospecting";
    else if (rand < 0.9) stage = "Qualified";
    else stage = "Lost";

    deals.push({
      title: dealNames[i],
      value,
      stage,
      ownerId: defaultUser.id,
      createdAt,
      updatedAt: createdAt,
    });
  }

  await prisma.deal.createMany({
    data: deals,
  });

  console.log(`✅ Created ${deals.length} deals`);
  console.log("📊 Stage distribution:");
  const stageCounts = deals.reduce((acc, deal) => {
    acc[deal.stage] = (acc[deal.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  Object.entries(stageCounts).forEach(([stage, count]) => {
    console.log(`   ${stage}: ${count}`);
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
