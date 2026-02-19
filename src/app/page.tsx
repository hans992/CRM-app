import { Dashboard, AddDealButton } from "@/components/dashboard";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const deals = await prisma.deal.findMany();

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">CRM Dashboard</h1>
        <AddDealButton />
      </div>
      <Dashboard deals={deals} />
    </main>
  );
}
