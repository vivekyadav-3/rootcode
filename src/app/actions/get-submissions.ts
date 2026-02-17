"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function getProblemSubmissions(problemId: string) {
  const user = await currentUser();
  if (!user) return [];

  // Verify connection
  await prisma.$connect();

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) return [];

  const submissions = await prisma.submission.findMany({
    where: {
      problemId,
      userId: dbUser.id,
    },
    orderBy: { createdAt: "desc" },
    take: 20, // Limit to 20 recent submissions for performance
  });

  // Manually serialize dates for cleaner client transfer
  const serializedSubmissions = submissions.map(sub => ({
    ...sub,
    createdAt: sub.createdAt.toISOString()
  }));

  return serializedSubmissions;
}
