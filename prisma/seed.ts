import { prisma } from "../src/lib/prisma";

async function main() {
  const problems = [
    {
      order: 1,
      title: "Two Sum",
      difficulty: "EASY",
      category: "Array",
      description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
      starterCode: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};",
      testCases: [
        { input: "[2,7,11,15]\n9", expectedOutput: "[0,1]" },
        { input: "[3,2,4]\n6", expectedOutput: "[1,2]" }
      ]
    },
    {
      order: 2,
      title: "Palindrome Number",
      difficulty: "EASY",
      category: "Math",
      description: "Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.",
      starterCode: "/**\n * @param {number} x\n * @return {boolean}\n */\nvar isPalindrome = function(x) {\n    \n};",
      testCases: [
        { input: "121", expectedOutput: "true" },
        { input: "-121", expectedOutput: "false" }
      ]
    },
    {
      order: 3,
      title: "Reverse String",
      difficulty: "EASY",
      category: "String",
      description: "Write a function that reverses a string. The input string is given as a string `s`.",
      starterCode: "/**\n * @param {string} s\n * @return {string}\n */\nvar reverseString = function(s) {\n    \n};",
      testCases: [
        { input: "\"hello\"", expectedOutput: "\"olleh\"" },
        { input: "\"Hannah\"", expectedOutput: "\"hannaH\"" }
      ]
    },
    {
      order: 4,
      title: "Factorial",
      difficulty: "EASY",
      category: "Math",
      description: "Given an integer `n`, return the factorial of `n`.",
      starterCode: "/**\n * @param {number} n\n * @return {number}\n */\nvar factorial = function(n) {\n    \n};",
      testCases: [
        { input: "5", expectedOutput: "120" },
        { input: "0", expectedOutput: "1" }
      ]
    },
    {
      order: 5,
      title: "Fibonacci Number",
      difficulty: "EASY",
      category: "Math",
      description: "The Fibonacci numbers, commonly denoted `F(n)` form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.",
      starterCode: "/**\n * @param {number} n\n * @return {number}\n */\nvar fib = function(n) {\n    \n};",
      testCases: [
        { input: "2", expectedOutput: "1" },
        { input: "3", expectedOutput: "2" },
        { input: "4", expectedOutput: "3" }
      ]
    },
    {
      order: 6,
      title: "Valid Anagram",
      difficulty: "EASY",
      category: "String",
      description: "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.",
      starterCode: "/**\n * @param {string} s\n * @param {string} t\n * @return {boolean}\n */\nvar isAnagram = function(s, t) {\n    \n};",
      testCases: [
        { input: "\"anagram\"\n\"nagaram\"", expectedOutput: "true" },
        { input: "\"rat\"\n\"car\"", expectedOutput: "false" }
      ]
    },
    {
      order: 7,
      title: "Climbing Stairs",
      difficulty: "MEDIUM",
      category: "Dynamic Programming",
      description: "You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
      starterCode: "/**\n * @param {number} n\n * @return {number}\n */\nvar climbStairs = function(n) {\n    \n};",
      testCases: [
        { input: "2", expectedOutput: "2" },
        { input: "3", expectedOutput: "3" }
      ]
    },
    {
      order: 8,
      title: "Missing Number",
      difficulty: "EASY",
      category: "Array",
      description: "Given an array `nums` containing `n` distinct numbers in the range `[0, n]`, return the only number in the range that is missing from the array.",
      starterCode: "/**\n * @param {number[]} nums\n * @return {number}\n */\nvar missingNumber = function(nums) {\n    \n};",
      testCases: [
        { input: "[3,0,1]", expectedOutput: "2" },
        { input: "[0,1]", expectedOutput: "2" }
      ]
    },
    {
      order: 9,
      title: "Single Number",
      difficulty: "EASY",
      category: "Bit Manipulation",
      description: "Given a non-empty array of integers `nums`, every element appears twice except for one. Find that single one.",
      starterCode: "/**\n * @param {number[]} nums\n * @return {number}\n */\nvar singleNumber = function(nums) {\n    \n};",
      testCases: [
        { input: "[2,2,1]", expectedOutput: "1" },
        { input: "[4,1,2,1,2]", expectedOutput: "4" }
      ]
    },
    {
      order: 10,
      title: "Power of Two",
      difficulty: "EASY",
      category: "Math",
      description: "Given an integer `n`, return `true` if it is a power of two. Otherwise, return `false`.",
      starterCode: "/**\n * @param {number} n\n * @return {boolean}\n */\nvar isPowerOfTwo = function(n) {\n    \n};",
      testCases: [
        { input: "1", expectedOutput: "true" },
        { input: "16", expectedOutput: "true" },
        { input: "3", expectedOutput: "false" }
      ]
    },
    {
      order: 11,
      title: "Search Insert Position",
      difficulty: "MEDIUM",
      category: "Array",
      description: "Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.",
      starterCode: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number}\n */\nvar searchInsert = function(nums, target) {\n    \n};",
      testCases: [
        { input: "[1,3,5,6]\n5", expectedOutput: "2" },
        { input: "[1,3,5,6]\n2", expectedOutput: "1" }
      ]
    },
    {
      order: 12,
      title: "Length of Last Word",
      difficulty: "EASY",
      category: "String",
      description: "Given a string `s` consisting of words and spaces, return the length of the last word in the string.",
      starterCode: "/**\n * @param {string} s\n * @return {number}\n */\nvar lengthOfLastWord = function(s) {\n    \n};",
      testCases: [
        { input: "\"Hello World\"", expectedOutput: "5" },
        { input: "\"   fly me   to   the moon  \"", expectedOutput: "4" }
      ]
    },
    {
      order: 13,
      title: "Squares of a Sorted Array",
      difficulty: "EASY",
      category: "Two Pointers",
      description: "Given an integer array `nums` sorted in non-decreasing order, return an array of the squares of each number sorted in non-decreasing order.",
      starterCode: "/**\n * @param {number[]} nums\n * @return {number[]}\n */\nvar sortedSquares = function(nums) {\n    \n};",
      testCases: [
        { input: "[-4,-1,0,3,10]", expectedOutput: "[0,1,9,16,100]" },
        { input: "[-7,-3,2,3,11]", expectedOutput: "[4,9,9,49,121]" }
      ]
    },
    {
      order: 14,
      title: "Maximum Average Subarray I",
      difficulty: "MEDIUM",
      category: "Sliding Window",
      description: "You are given an integer array `nums` consisting of `n` elements, and an integer `k`.\n\nFind a contiguous subarray whose length is equal to `k` that has the maximum average value and return this value.",
      starterCode: "/**\n * @param {number[]} nums\n * @param {number} k\n * @return {number}\n */\nvar findMaxAverage = function(nums, k) {\n    \n};",
      testCases: [
        { input: "[1,12,-5,-6,50,3]\n4", expectedOutput: "12.75" },
        { input: "[5]\n1", expectedOutput: "5" }
      ]
    },
    {
      order: 15,
      title: "Binary Search",
      difficulty: "EASY",
      category: "Binary Search",
      description: "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.",
      starterCode: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number}\n */\nvar search = function(nums, target) {\n    \n};",
      testCases: [
        { input: "[-1,0,3,5,9,12]\n9", expectedOutput: "4" },
        { input: "[-1,0,3,5,9,12]\n2", expectedOutput: "-1" }
      ]
    },
    {
      order: 16,
      title: "Contains Duplicate",
      difficulty: "EASY",
      category: "Hashing",
      description: "Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.",
      starterCode: "/**\n * @param {number[]} nums\n * @return {boolean}\n */\nvar containsDuplicate = function(nums) {\n    \n};",
      testCases: [
        { input: "[1,2,3,1]", expectedOutput: "true" },
        { input: "[1,2,3,4]", expectedOutput: "false" }
      ]
    },
    {
      order: 17,
      title: "Best Time to Buy and Sell Stock",
      difficulty: "MEDIUM",
      category: "Sliding Window",
      description: "You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`th day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
      starterCode: "/**\n * @param {number[]} prices\n * @return {number}\n */\nvar maxProfit = function(prices) {\n    \n};",
      testCases: [
        { input: "[7,1,5,3,6,4]", expectedOutput: "5" },
        { input: "[7,6,4,3,1]", expectedOutput: "0" }
      ]
    },
    {
      order: 18,
      title: "Majority Element",
      difficulty: "MEDIUM",
      category: "Hashing",
      description: "Given an array `nums` of size `n`, return the majority element.\n\nThe majority element is the element that appears more than `⌊n / 2⌋` times. You may assume that the majority element always exists in the array.",
      starterCode: "/**\n * @param {number[]} nums\n * @return {number}\n */\nvar majorityElement = function(nums) {\n    \n};",
      testCases: [
        { input: "[3,2,3]", expectedOutput: "3" },
        { input: "[2,2,1,1,1,2,2]", expectedOutput: "2" }
      ]
    },
    {
      order: 19,
      title: "Move Zeroes",
      difficulty: "EASY",
      category: "Two Pointers",
      description: "Given an integer array `nums`, move all 0's to the end of it while maintaining the relative order of the non-zero elements.\n\nNote that you must do this in-place without making a copy of the array.",
      starterCode: "/**\n * @param {number[]} nums\n * @return {void} Do not return anything, modify nums in-place instead.\n */\nvar moveZeroes = function(nums) {\n    \n};",
      testCases: [
        { input: "[0,1,0,3,12]", expectedOutput: "[1,3,12,0,0]" },
        { input: "[0]", expectedOutput: "[0]" }
      ]
    }
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
        // Default solution (can be empty for now or placeholder)
        solutionCode: "// Solution not provided yet",
        testCases: {
          create: p.testCases
        }
      }
    });
    console.log(`Upserted problem: ${p.title}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
