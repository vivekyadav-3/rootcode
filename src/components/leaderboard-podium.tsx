"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserStat {
  id: string;
  name: string;
  solvedCount: number;
  email: string;
  imageUrl?: string;
}

interface PodiumProps {
  topUsers: UserStat[];
}

export function LeaderboardPodium({ topUsers }: PodiumProps) {
  const first = topUsers[0];
  const second = topUsers[1];
  const third = topUsers[2];

  return (
    <div className="flex justify-center items-end gap-4 mb-12 h-[300px] w-full max-w-2xl mx-auto">
      {/* 2nd Place */}
      {second && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center z-10"
        >
          <div className="mb-2 flex flex-col items-center">
            <div className="relative">
                <Avatar className="h-16 w-16 border-4 border-slate-300 shadow-xl">
                    <AvatarImage src={second.imageUrl} />
                    <AvatarFallback className="bg-slate-200 text-slate-500 font-bold text-xl">
                        {second.name[0]}
                    </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-1 bg-slate-300 rounded-full p-1 border-2 border-slate-400 text-xs font-bold text-slate-700 w-6 h-6 flex items-center justify-center">
                    2
                </div>
            </div>
            <span className="font-bold mt-2 text-slate-300 text-sm max-w-[100px] truncate text-center">{second.name}</span>
            <span className="text-xs text-slate-400">{second.solvedCount} Solved</span>
          </div>
          <div className="w-24 bg-gradient-to-t from-slate-400 to-slate-300 h-32 rounded-t-lg shadow-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-2 w-full text-center text-slate-600 font-black text-4xl opacity-20">2</div>
          </div>
        </motion.div>
      )}

      {/* 1st Place */}
      {first && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center z-20"
        >
           <div className="mb-2 flex flex-col items-center">
             <div className="relative">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce">
                    👑
                </div>
                <Avatar className="h-24 w-24 border-4 border-yellow-400 shadow-2xl ring-4 ring-yellow-400/20">
                    <AvatarImage src={first.imageUrl} />
                    <AvatarFallback className="bg-yellow-200 text-yellow-600 font-bold text-3xl">
                        {first.name[0]}
                    </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-3 -right-2 bg-yellow-400 rounded-full p-1 border-2 border-yellow-500 text-sm font-bold text-yellow-800 w-8 h-8 flex items-center justify-center shadow-md">
                    1
                </div>
             </div>
             <span className="font-bold mt-3 text-yellow-400 text-lg max-w-[120px] truncate text-center drop-shadow-sm">{first.name}</span>
             <span className="text-sm text-yellow-500/80 font-medium">{first.solvedCount} Solved</span>
           </div>
           <div className="w-32 bg-gradient-to-t from-yellow-400 to-yellow-300 h-48 rounded-t-lg shadow-xl relative overflow-hidden group border-t border-yellow-200">
             <div className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
             <div className="absolute bottom-4 w-full text-center text-yellow-600 font-black text-6xl opacity-20">1</div>
           </div>
        </motion.div>
      )}

      {/* 3rd Place */}
      {third && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col items-center z-10"
        >
           <div className="mb-2 flex flex-col items-center">
             <div className="relative">
                <Avatar className="h-16 w-16 border-4 border-orange-300 shadow-xl">
                    <AvatarImage src={third.imageUrl} />
                    <AvatarFallback className="bg-orange-200 text-orange-600 font-bold text-xl">
                        {third.name[0]}
                    </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-1 bg-orange-300 rounded-full p-1 border-2 border-orange-400 text-xs font-bold text-orange-800 w-6 h-6 flex items-center justify-center">
                    3
                </div>
             </div>
             <span className="font-bold mt-2 text-orange-300 text-sm max-w-[100px] truncate text-center">{third.name}</span>
             <span className="text-xs text-orange-400">{third.solvedCount} Solved</span>
           </div>
           <div className="w-24 bg-gradient-to-t from-orange-400 to-orange-300 h-24 rounded-t-lg shadow-lg relative overflow-hidden group">
             <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="absolute bottom-2 w-full text-center text-orange-700 font-black text-4xl opacity-20">3</div>
           </div>
        </motion.div>
      )}
    </div>
  );
}
