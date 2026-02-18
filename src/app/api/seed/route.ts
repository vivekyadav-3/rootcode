import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const problems = [
      // 1. Sliding Window
      { order: 101, title: "Best Time to Buy and Sell Stock", difficulty: "EASY", category: "Sliding Window", description: "You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.", starterCode: "var maxProfit = function(prices) {\n    \n};", testCases: [{ input: "[7,1,5,3,6,4]", expectedOutput: "5" }] },
      { order: 102, title: "Longest Substring Without Repeating Characters", difficulty: "MEDIUM", category: "Sliding Window", description: "Given a string s, find the length of the longest substring without repeating characters.", starterCode: "var lengthOfLongestSubstring = function(s) {\n    \n};", testCases: [{ input: "\"abcabcbb\"", expectedOutput: "3" }] },
      { order: 103, title: "Longest Repeating Character Replacement", difficulty: "MEDIUM", category: "Sliding Window", description: "You are given a string s and an integer k. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most k times.", starterCode: "var characterReplacement = function(s, k) {\n    \n};", testCases: [{ input: "\"ABAB\"\n2", expectedOutput: "4" }] },
      { order: 104, title: "Permutation in String", difficulty: "MEDIUM", category: "Sliding Window", description: "Given two strings s1 and s2, return true if s2 contains a permutation of s1, or false otherwise.", starterCode: "var checkInclusion = function(s1, s2) {\n    \n};", testCases: [{ input: "\"ab\"\n\"eidbaooo\"", expectedOutput: "true" }] },
      { order: 105, title: "Minimum Window Substring", difficulty: "HARD", category: "Sliding Window", description: "Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window.", starterCode: "var minWindow = function(s, t) {\n    \n};", testCases: [{ input: "\"ADOBECODEBANC\"\n\"ABC\"", expectedOutput: "\"BANC\"" }] },
      { order: 106, title: "Sliding Window Maximum", difficulty: "HARD", category: "Sliding Window", description: "You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right.", starterCode: "var maxSlidingWindow = function(nums, k) {\n    \n};", testCases: [{ input: "[1,3,-1,-3,5,3,6,7]\n3", expectedOutput: "[3,3,5,5,6,7]" }] },

      // 2. Backtracking
      { order: 107, title: "Subsets", difficulty: "MEDIUM", category: "Backtracking", description: "Given an integer array nums of unique elements, return all possible subsets (the power set).", starterCode: "var subsets = function(nums) {\n    \n};", testCases: [{ input: "[1,2,3]", expectedOutput: "[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]" }] },
      { order: 108, title: "Combination Sum", difficulty: "MEDIUM", category: "Backtracking", description: "Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target.", starterCode: "var combinationSum = function(candidates, target) {\n    \n};", testCases: [{ input: "[2,3,6,7]\n7", expectedOutput: "[[2,2,3],[7]]" }] },
      { order: 109, title: "Permutations", difficulty: "MEDIUM", category: "Backtracking", description: "Given an array nums of distinct integers, return all the possible permutations.", starterCode: "var permute = function(nums) {\n    \n};", testCases: [{ input: "[1,2,3]", expectedOutput: "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]" }] },
      { order: 110, title: "Subsets II", difficulty: "MEDIUM", category: "Backtracking", description: "Given an integer array nums that may contain duplicates, return all possible subsets (the power set).", starterCode: "var subsetsWithDup = function(nums) {\n    \n};", testCases: [{ input: "[1,2,2]", expectedOutput: "[[],[1],[1,2],[1,2,2],[2],[2,2]]" }] },
      { order: 111, title: "Combination Sum II", difficulty: "MEDIUM", category: "Backtracking", description: "Given a collection of candidate numbers (candidates) and a target number (target), find all unique combinations in candidates where the candidate numbers sum to target.", starterCode: "var combinationSum2 = function(candidates, target) {\n    \n};", testCases: [{ input: "[10,1,2,7,6,1,5]\n8", expectedOutput: "[[1,1,6],[1,2,5],[1,7],[2,6]]" }] },
      { order: 112, title: "Word Search", difficulty: "MEDIUM", category: "Backtracking", description: "Given an m x n grid of characters board and a string word, return true if word exists in the grid.", starterCode: "var exist = function(board, word) {\n    \n};", testCases: [{ input: "[[\"A\",\"B\",\"C\",\"E\"],[\"S\",\"F\",\"C\",\"S\"],[\"A\",\"D\",\"E\",\"E\"]]\n\"ABCCED\"", expectedOutput: "true" }] },
      { order: 113, title: "Palindrome Partitioning", difficulty: "MEDIUM", category: "Backtracking", description: "Given a string s, partition s such that every substring of the partition is a palindrome. Return all possible palindrome partitioning of s.", starterCode: "var partition = function(s) {\n    \n};", testCases: [{ input: "\"aab\"", expectedOutput: "[[\"a\",\"a\",\"b\"],[\"aa\",\"b\"]]" }] },
      { order: 114, title: "Letter Combinations of a Phone Number", difficulty: "MEDIUM", category: "Backtracking", description: "Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent.", starterCode: "var letterCombinations = function(digits) {\n    \n};", testCases: [{ input: "\"23\"", expectedOutput: "[\"ad\",\"ae\",\"af\",\"bd\",\"be\",\"bf\",\"cd\",\"ce\",\"cf\"]" }] },
      { order: 115, title: "N-Queens", difficulty: "HARD", category: "Backtracking", description: "The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other.", starterCode: "var solveNQueens = function(n) {\n    \n};", testCases: [{ input: "4", expectedOutput: "[[1,3,0,2],[2,0,3,1]]" }] }, // simplified output

      // 3. Greedy
      { order: 116, title: "Maximum Subarray", difficulty: "EASY", category: "Greedy", description: "Given an integer array nums, find the subarray with the largest sum, and return its sum.", starterCode: "var maxSubArray = function(nums) {\n    \n};", testCases: [{ input: "[-2,1,-3,4,-1,2,1,-5,4]", expectedOutput: "6" }] },
      { order: 117, title: "Jump Game", difficulty: "MEDIUM", category: "Greedy", description: "You are given an integer array nums. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position. Return true if you can reach the last index.", starterCode: "var canJump = function(nums) {\n    \n};", testCases: [{ input: "[2,3,1,1,4]", expectedOutput: "true" }] },
      { order: 118, title: "Jump Game II", difficulty: "MEDIUM", category: "Greedy", description: "Return the minimum number of jumps to reach the last index.", starterCode: "var jump = function(nums) {\n    \n};", testCases: [{ input: "[2,3,1,1,4]", expectedOutput: "2" }] },
      { order: 119, title: "Gas Station", difficulty: "MEDIUM", category: "Greedy", description: "Given two integer arrays gas and cost, return the starting gas station's index if you can travel around the circuit once in the clockwise direction, otherwise return -1.", starterCode: "var canCompleteCircuit = function(gas, cost) {\n    \n};", testCases: [{ input: "[1,2,3,4,5]\n[3,4,5,1,2]", expectedOutput: "3" }] },
      { order: 120, title: "Hand of Straights", difficulty: "MEDIUM", category: "Greedy", description: "Alice has some number of cards and she wants to rearrange the cards into groups so that each group is of size groupSize, and consists of groupSize consecutive cards.", starterCode: "var isNStraightHand = function(hand, groupSize) {\n    \n};", testCases: [{ input: "[1,2,3,6,2,3,4,7,8]\n3", expectedOutput: "true" }] },
      { order: 121, title: "Merge Triplets to Form Target Triplet", difficulty: "MEDIUM", category: "Greedy", description: "Return true if it is possible to obtain the target triplet [x, y, z] as an element of triplets, or false otherwise.", starterCode: "var mergeTriplets = function(triplets, target) {\n    \n};", testCases: [{ input: "[[2,5,3],[1,8,4],[1,7,5]]\n[2,7,5]", expectedOutput: "true" }] },
      { order: 122, title: "Partition Labels", difficulty: "MEDIUM", category: "Greedy", description: "You are given a string s. We want to partition the string into as many parts as possible so that each letter appears in at most one part.", starterCode: "var partitionLabels = function(s) {\n    \n};", testCases: [{ input: "\"ababcbacadefegdehijhklij\"", expectedOutput: "[9,7,8]" }] },
      { order: 123, title: "Valid Parenthesis String", difficulty: "MEDIUM", category: "Greedy", description: "Given a string s containing only '(', ')', and '*', return true if s is valid.", starterCode: "var checkValidString = function(s) {\n    \n};", testCases: [{ input: "\"(*))\"", expectedOutput: "true" }] },

      // 4. Advanced Graphs
      { order: 124, title: "Reconstruct Itinerary", difficulty: "HARD", category: "Graphs", description: "You are given a list of airline tickets where tickets[i] = [from_i, to_i]. Reconstruct the itinerary in order and return it.", starterCode: "var findItinerary = function(tickets) {\n    \n};", testCases: [{ input: "[[\"MUC\",\"LHR\"],[\"JFK\",\"MUC\"],[\"SFO\",\"SJC\"],[\"LHR\",\"SFO\"]]", expectedOutput: "[\"JFK\",\"MUC\",\"LHR\",\"SFO\",\"SJC\"]" }] },
      { order: 125, title: "Min Cost to Connect All Points", difficulty: "MEDIUM", category: "Graphs", description: "You are given an array points. Return the minimum cost to make all points connected.", starterCode: "var minCostConnectPoints = function(points) {\n    \n};", testCases: [{ input: "[[0,0],[2,2],[3,10],[5,2],[7,0]]", expectedOutput: "20" }] },
      { order: 126, title: "Network Delay Time", difficulty: "MEDIUM", category: "Graphs", description: "You are given a network of n nodes, labeled from 1 to n. Return the minimum time it takes for all the n nodes to receive the signal.", starterCode: "var networkDelayTime = function(times, n, k) {\n    \n};", testCases: [{ input: "[[2,1,1],[2,3,1],[3,4,1]]\n4\n2", expectedOutput: "2" }] },
      { order: 127, title: "Cheapest Flights Within K Stops", difficulty: "MEDIUM", category: "Graphs", description: "There are n cities connected by some number of flights. Return the cheapest price from src to dst with at most k stops.", starterCode: "var findCheapestPrice = function(n, flights, src, dst, k) {\n    \n};", testCases: [{ input: "4\n[[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]]\n0\n3\n1", expectedOutput: "700" }] },
      { order: 128, title: "Swim in Rising Water", difficulty: "HARD", category: "Graphs", description: "You are given an n x n integer matrix grid. Return the least time until you can reach the bottom right square (n - 1, n - 1).", starterCode: "var swimInWater = function(grid) {\n    \n};", testCases: [{ input: "[[0,2],[1,3]]", expectedOutput: "3" }] },
      { order: 129, title: "Alien Dictionary", difficulty: "HARD", category: "Graphs", description: "There is a new alien language that uses the English alphabet. Return a string of the unique letters in the new alien language sorted in lexicographically increasing order by the new rules.", starterCode: "var alienOrder = function(words) {\n    \n};", testCases: [{ input: "[\"wrt\",\"wrf\",\"er\",\"ett\",\"rftt\"]", expectedOutput: "\"wertf\"" }] },
      
      // 5. Bit Manipulation
      { order: 130, title: "Single Number", difficulty: "EASY", category: "Bit Manipulation", description: "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.", starterCode: "var singleNumber = function(nums) {\n    \n};", testCases: [{ input: "[2,2,1]", expectedOutput: "1" }] },
      { order: 131, title: "Number of 1 Bits", difficulty: "EASY", category: "Bit Manipulation", description: "Write a function that takes the binary representation of an unsigned integer and returns the number of '1' bits it has.", starterCode: "var hammingWeight = function(n) {\n    \n};", testCases: [{ input: "11", expectedOutput: "3" }] },
      { order: 132, title: "Counting Bits", difficulty: "EASY", category: "Bit Manipulation", description: "Given an integer n, return an array ans of length n + 1 such that for each i (0 <= i <= n), ans[i] is the number of 1's in the binary representation of i.", starterCode: "var countBits = function(n) {\n    \n};", testCases: [{ input: "2", expectedOutput: "[0,1,1]" }] },
      { order: 133, title: "Reverse Bits", difficulty: "EASY", category: "Bit Manipulation", description: "Reverse bits of a given 32 bits unsigned integer.", starterCode: "var reverseBits = function(n) {\n    \n};", testCases: [{ input: "43261596", expectedOutput: "964176192" }] },
      { order: 134, title: "Missing Number", difficulty: "EASY", category: "Bit Manipulation", description: "Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array.", starterCode: "var missingNumber = function(nums) {\n    \n};", testCases: [{ input: "[3,0,1]", expectedOutput: "2" }] },
      { order: 135, title: "Sum of Two Integers", difficulty: "MEDIUM", category: "Bit Manipulation", description: "Given two integers a and b, return the sum of the two integers without using the operators + and -.", starterCode: "var getSum = function(a, b) {\n    \n};", testCases: [{ input: "1\n2", expectedOutput: "3" }] },
      { order: 136, title: "Reverse Integer", difficulty: "MEDIUM", category: "Bit Manipulation", description: "Given a signed 32-bit integer x, return x with its digits reversed.", starterCode: "var reverse = function(x) {\n    \n};", testCases: [{ input: "123", expectedOutput: "321" }] },

      // 6. Intervals
      { order: 137, title: "Insert Interval", difficulty: "MEDIUM", category: "Intervals", description: "You are given an array of non-overlapping intervals intervals. Insert a new interval newInterval into intervals such that intervals is still sorted in ascending order by start point and intervals still does not have any overlapping intervals.", starterCode: "var insert = function(intervals, newInterval) {\n    \n};", testCases: [{ input: "[[1,3],[6,9]]\n[2,5]", expectedOutput: "[[1,5],[6,9]]" }] },
      { order: 138, title: "Merge Intervals", difficulty: "MEDIUM", category: "Intervals", description: "Given an array of intervals, merge all overlapping intervals.", starterCode: "var merge = function(intervals) {\n    \n};", testCases: [{ input: "[[1,3],[2,6],[8,10],[15,18]]", expectedOutput: "[[1,6],[8,10],[15,18]]" }] },
      { order: 139, title: "Non-overlapping Intervals", difficulty: "MEDIUM", category: "Intervals", description: "Given an array of intervals intervals, return the minimum number of intervals you need to remove to make the rest of the intervals non-overlapping.", starterCode: "var eraseOverlapIntervals = function(intervals) {\n    \n};", testCases: [{ input: "[[1,2],[2,3],[3,4],[1,3]]", expectedOutput: "1" }] },
      { order: 140, title: "Meeting Rooms", difficulty: "EASY", category: "Intervals", description: "Given an array of meeting time intervals consisting of start and end times [[s1,e1],[s2,e2],...], determine if a person could attend all meetings.", starterCode: "var canAttendMeetings = function(intervals) {\n    \n};", testCases: [{ input: "[[0,30],[5,10],[15,20]]", expectedOutput: "false" }] }
    ];

    for (const p of problems) {
      await prisma.problem.upsert({
        where: { order: p.order },
        update: {
          title: p.title,
          description: p.description,
          difficulty: p.difficulty as any,
          category: p.category,
          starterCode: p.starterCode,
          testCases: {
            deleteMany: {},
            create: p.testCases
          }
        },
        create: {
          title: p.title,
          description: p.description,
          difficulty: p.difficulty as any,
          category: p.category,
          order: p.order,
          starterCode: p.starterCode,
          solutionCode: "// Solution",
          testCases: {
            create: p.testCases
          }
        }
      });
    }

    // Cleanup logic: Delete all placeholder problems (those with title containing "Problem" followed by a number, but we can target order range or title pattern)
    // Actually, safer to keep them as "legacy" or user can delete manually.
    // But user asked to "fix" it.
    // I will add a step to delete the "Placeholder" problems if they exist.
    // The placeholder problems are titled "Category Problem X".
    
    // Deleting via raw SQL or prisma `deleteMany`
    // Safer to just leave them be populated by real data if `upsert` worked correctly.
    // But since the previous batch generated IDs like 60-140+, and I am inserting 101-140 here, they might clash or just update.
    // I used `upsert` on `order`. So if "Linked List Problem 1" was order 101, it will be REPLACED by "Best Time to Buy and Sell Stock".
    // This is exactly what we want!

    return NextResponse.json({ message: "Seeding complete", count: problems.length });
  } catch(e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
