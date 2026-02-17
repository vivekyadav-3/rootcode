import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Delete problems that match the dummy naming pattern
  const deleted = await prisma.problem.deleteMany({
    where: {
      OR: [
        { title: { contains: "Problem 1" } },
        { title: { contains: "Problem 2" } },
        { title: { contains: "Problem 3" } },
        { title: { contains: "Problem 4" } },
        { title: { contains: "Problem 5" } },
        { title: { contains: "Problem 6" } },
        { title: { contains: "Problem 7" } },
        { title: { contains: "Problem 8" } },
        { title: { contains: "Problem 9" } },
        { title: { contains: "Problem 10" } },
      ]
    }
  });

  console.log(`Successfully removed ${deleted.count} placeholder problems.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
