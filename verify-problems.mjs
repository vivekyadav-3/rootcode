import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.problem.count();
  const problems = await prisma.problem.findMany({
    select: { id: true, title: true, order: true },
    orderBy: { order: 'asc' }
  });
  
  console.log(`Total problems: ${count}`);
  console.log("Current Problem List (First 5):");
  problems.slice(0, 5).forEach(p => console.log(`[#${p.order}] ${p.title}`));
  
  console.log("Current Problem List (Last 5):");
  problems.slice(-5).forEach(p => console.log(`[#${p.order}] ${p.title}`));
}

main().finally(() => prisma.$disconnect());
