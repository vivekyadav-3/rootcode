import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { LeaderboardPodium } from "@/components/leaderboard-podium";
// ... imports

export default async function LeaderboardPage() {
  const sortedUsers: any = await prisma.$queryRaw`
    SELECT 
      u.id, 
      u.name, 
      u."imageUrl", 
      email,
      COUNT(DISTINCT s."problemId") as "solvedCount"
    FROM "User" u
    LEFT JOIN "Submission" s ON s."userId" = u.id AND s.status = 'Accepted'
    GROUP BY u.id, u.name, u."imageUrl", u.email
    ORDER BY "solvedCount" DESC
    LIMIT 50;
  `;

  const usersWithStats = sortedUsers.map((u: any) => ({
      ...u,
      solvedCount: Number(u.solvedCount)
  }));

  return (
    <div className="container mx-auto py-10 px-4 md:px-0 max-w-5xl">
      <div className="flex flex-col items-center mb-12 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
            Leaderboard
          </h1>
          <p className="text-muted-foreground mt-4 text-lg max-w-2xl">
            Celebrate the top performers in our community. Solve problems, climb the ranks, and earn your place on the podium!
          </p>
      </div>

      {/* Podium for Top 3 */}
      {usersWithStats.length > 0 && (
        <div className="mb-16">
            <LeaderboardPodium topUsers={usersWithStats.slice(0, 3)} />
        </div>
      )}

      <div className="border rounded-xl bg-card/50 backdrop-blur-sm overflow-hidden shadow-2xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Problems Solved</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersWithStats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                  No users found. Be the first to join!
                </TableCell>
              </TableRow>
            ) : (
              usersWithStats.map((user: any, index: number) => (
                <TableRow key={user.id} className="hover:bg-accent/50 transition-colors">
                  <TableCell className="font-medium">
                    {index + 1}
                    {index === 0 && <span className="ml-2">👑</span>}
                    {index === 1 && <span className="ml-2">🥈</span>}
                    {index === 2 && <span className="ml-2">🥉</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {/* Avatar can be added here if needed */}
                      <span className="font-medium">{user.name}</span>
                      {/* <span className="text-xs text-muted-foreground hidden md:inline">({user.email})</span> */}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-emerald-500">
                    {user.solvedCount}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
