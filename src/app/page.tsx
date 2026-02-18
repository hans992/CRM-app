import { Dashboard } from "@/components/dashboard";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const deals = await prisma.deal.findMany();

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <Dashboard deals={deals} />
    </main>
  );
}
