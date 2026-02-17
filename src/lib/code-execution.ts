
export function wrapCode(code: string, languageId: string, problemTitle: string): string {
  // Normalize line endings to avoid issues with template literals
  code = code.replace(/\r/g, "");
  const normalizedTitle = problemTitle.toLowerCase().trim();
  
  // Configuration for each problem's execution signature
  const problems: Record<string, { method: string; inputType: "int" | "string" | "array" | "two_args_arr_int" | "two_strings" | "class_methods"; outputType?: "void" | "array" | "boolean" }> = {
    "two sum": { method: "twoSum", inputType: "two_args_arr_int", outputType: "array" },
    "palindrome number": { method: "isPalindrome", inputType: "int", outputType: "boolean" },
    "reverse string": { method: "reverseString", inputType: "string" }, 
    "factorial": { method: "factorial", inputType: "int" },
    "fibonacci number": { method: "fib", inputType: "int" },
    "valid anagram": { method: "isAnagram", inputType: "two_strings", outputType: "boolean" },
    "climbing stairs": { method: "climbStairs", inputType: "int" },
    "missing number": { method: "missingNumber", inputType: "array" },
    "single number": { method: "singleNumber", inputType: "array" },
    "power of two": { method: "isPowerOfTwo", inputType: "int", outputType: "boolean" },
    "search insert position": { method: "searchInsert", inputType: "two_args_arr_int" },
    "length of last word": { method: "lengthOfLastWord", inputType: "string" },
    // New Problems
    "squares of a sorted array": { method: "sortedSquares", inputType: "array", outputType: "array" },
    "maximum average subarray i": { method: "findMaxAverage", inputType: "two_args_arr_int" }, // returns double
    "binary search": { method: "search", inputType: "two_args_arr_int" },
    "min stack": { method: "MinStack", inputType: "class_methods", outputType: "array" },
    "contains duplicate": { method: "containsDuplicate", inputType: "array", outputType: "boolean" },
    "best time to buy and sell stock": { method: "maxProfit", inputType: "array" },
    "majority element": { method: "majorityElement", inputType: "array" },
    "move zeroes": { method: "moveZeroes", inputType: "array", outputType: "void" },
    "restore ip addresses": { method: "restoreIpAddresses", inputType: "string", outputType: "array" }
  };

  const config = problems[normalizedTitle];
  if (!config) return code; // Fallback to raw code if not configured

  // JavaScript (Node.js) Wrapper
  if (languageId === "63") {
    const inputReading = `
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
    `;

    let parsingLogic = "";
    let executionCall = "";

    switch (config.inputType) {
      case "int":
        parsingLogic = `const arg = parseInt(input);`;
        executionCall = `const result = ${config.method}(arg);`;
        break;
      case "string":
        parsingLogic = `const arg = input.replace(/^"|"$/g, '');`; // basics to remove quotes if JSON
        executionCall = `const result = ${config.method}(arg);`;
        break;
      case "array":
        parsingLogic = `const arg = JSON.parse(input);`;
        executionCall = `const result = ${config.method}(arg);`;
        break;
      case "two_args_arr_int":
        parsingLogic = `
const lines = input.split('\\n');
let p1, p2;
if (lines.length >= 2) {
    p1 = JSON.parse(lines[0]);
    p2 = parseInt(lines[1]);
} else {
    // Fallback parsing
     const splitIndex = input.lastIndexOf(']');
    if (splitIndex !== -1) {
        p1 = JSON.parse(input.substring(0, splitIndex + 1));
        p2 = parseInt(input.substring(splitIndex + 1));
    }
}
        `;
        executionCall = `const result = ${config.method}(p1, p2);`;
        break;
      case "two_strings":
         parsingLogic = `
const lines = input.split('\\n');
const s = lines[0].replace(/^"|"$/g, '');
const t = lines[1].replace(/^"|"$/g, '');
         `;
         executionCall = `const result = ${config.method}(s, t);`;
         break;
      case "class_methods":
        parsingLogic = `
const lines = input.split('\\n');
const commands = JSON.parse(lines[0]);
const args = JSON.parse(lines[1]);
        `;
        executionCall = `
const instance = new ${config.method}();
const result = [];
for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];
    const arg = args[i];
    if (cmd === "${config.method}") {
        result.push(null);
    } else {
        const output = instance[cmd](...arg);
        result.push(output === undefined ? null : output);
    }
}
        `;
        break;
    }

    let outputLogic = `console.log(JSON.stringify(result));`;
    if (config.outputType === "void" && config.inputType === "array") {
        outputLogic = `console.log(JSON.stringify(arg));`; // Print modified array
    }

    return `
${code}

${inputReading}
${parsingLogic}
${executionCall}
${outputLogic}
    `;
  }
  
  // Python (3.8.1) Wrapper
  if (languageId === "71") {
    let parsingLogic = "";
    let executionCall = "";

    switch (config.inputType) {
      case "int":
        parsingLogic = `arg = int(sys.stdin.read().strip())`;
        executionCall = `result = sol.${config.method}(arg)`;
        break;
      case "string":
        parsingLogic = `arg = sys.stdin.read().strip().strip('"')`;
        executionCall = `result = sol.${config.method}(arg)`;
        break;
      case "array":
        parsingLogic = `arg = json.loads(sys.stdin.read().strip())`;
        executionCall = `result = sol.${config.method}(arg)`;
        break;
      case "two_args_arr_int":
        parsingLogic = `
raw_input = sys.stdin.read().strip()
if not raw_input:
    p1 = []
    p2 = 0
else:
    lines = raw_input.split('\\n')
    if len(lines) >= 2:
        try:
            p1 = json.loads(lines[0])
            p2 = int(lines[1])
        except:
             idx = raw_input.rfind(']')
             if idx != -1:
                 p1 = json.loads(raw_input[:idx+1])
                 try:
                    p2 = int(raw_input[idx+1:])
                 except:
                    p2 = 0
             else:
                 p1 = []
                 p2 = 0
    else:
        idx = raw_input.rfind(']')
        if idx != -1:
             p1 = json.loads(raw_input[:idx+1])
             try:
                p2 = int(raw_input[idx+1:])
             except:
                p2 = 0
        else:
             p1 = []
             p2 = 0
`;
        executionCall = `result = sol.${config.method}(p1, p2)`;
        break;
      case "two_strings":
          parsingLogic = `
lines = sys.stdin.read().strip().split('\\n')
if len(lines) >= 2:
    s = lines[0].strip().strip('"')
    t = lines[1].strip().strip('"')
else:
    s = ""
    t = ""
`;
          executionCall = `result = sol.${config.method}(s, t)`;
          break;
      case "class_methods":
          parsingLogic = `
lines = sys.stdin.read().strip().split('\\n')
commands = json.loads(lines[0])
args = json.loads(lines[1])
`;
          executionCall = `
# No 'sol = Solution()' here
instance = ${config.method}()
result = []
for i, cmd in enumerate(commands):
    if cmd == "${config.method}":
        result.append(None)
    else:
        func = getattr(instance, cmd)
        arg = args[i]
        out = func(*arg)
        result.append(out)
`;
          break;
    }

    let outputLogic = `print(json.dumps(result, separators=(',', ':')))`;
    if (config.outputType === "void" && config.inputType === "array") {
        outputLogic = `print(json.dumps(arg, separators=(',', ':')))`;
    }

    return `
import sys
import json
from typing import List, Optional

${code}

if __name__ == '__main__':
    ${config.inputType !== 'class_methods' ? 'sol = Solution()' : ''}
    ${parsingLogic}
    ${executionCall}
    ${outputLogic}
`;
  }

  // Java (OpenJDK 13.0.1) Wrapper
  if (languageId === "62") {
    // Sanitize user code: remove public from class Solution to avoid naming conflicts with Main
    // Also use a more robust regex to handle comments/whitespace before the class keyword
    const sanitizedCode = code.replace(/public\s+class\s+Solution/i, "class Solution");
    
    let parsingLogic = `
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        String line = reader.readLine();
        if (line == null) return;
    `;
    let executionCall = "";
    let helperMethods = "";
    
    // Shared Helper Methods definition for Java
    const arrayHelpers = `
    private static int[] parseArray(String s) {
        s = s.trim();
        if (s.length() < 2) return new int[0];
        s = s.substring(1, s.length() - 1);
        if (s.isEmpty()) return new int[0];
        String[] parts = s.split(",");
        int[] res = new int[parts.length];
        for(int i=0; i<parts.length; i++) {
            res[i] = Integer.parseInt(parts[i].trim());
        }
        return res;
    }

    private static String arrayToString(int[] arr) {
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for(int i=0; i<arr.length; i++) {
            sb.append(arr[i]);
            if (i < arr.length - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }
    `;

    switch (config.inputType) {
      case "int":
        parsingLogic += `
        int arg = Integer.parseInt(line.trim());
        `;
        executionCall = `
        Solution sol = new Solution();
        ${ config.outputType === 'boolean' ? 'boolean' : 'int' } result = sol.${config.method}(arg);
        System.out.println(result);
        `;
        break;
      case "string":
        parsingLogic += `
        String arg = line.trim();
        if (arg.startsWith("\\"") && arg.endsWith("\\"")) {
            arg = arg.substring(1, arg.length() - 1);
        }
        `;
        executionCall = `
        Solution sol = new Solution();
        String result = sol.${config.method}(arg);
        System.out.println("\\"" + result + "\\"");
        `;
        break;
      case "array":
        parsingLogic += `
        int[] arg = parseArray(line);
        `;
        if (config.outputType === "void") {
            executionCall = `
            Solution sol = new Solution();
            sol.${config.method}(arg);
            System.out.println(arrayToString(arg));
            `;
        } else if (config.outputType === "array") {
            executionCall = `
            Solution sol = new Solution();
            int[] result = sol.${config.method}(arg);
            System.out.println(arrayToString(result));
            `;
        } else if (config.outputType === "boolean") {
            executionCall = `
            Solution sol = new Solution();
            boolean result = sol.${config.method}(arg);
            System.out.println(result);
            `;
        } else {
            executionCall = `
            Solution sol = new Solution();
            var result = sol.${config.method}(arg);
            System.out.println(result);
            `;
        }
        helperMethods += arrayHelpers;
        break;
      case "two_args_arr_int":
        parsingLogic = `
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        String line1 = reader.readLine();
        if (line1 == null) return;
        String line2 = reader.readLine();
        if (line2 == null) return;
        
        int[] p1 = parseArray(line1);
        int p2 = Integer.parseInt(line2.trim());
        `;
        if (config.outputType === "array") {
            executionCall = `
            Solution sol = new Solution();
            int[] result = sol.${config.method}(p1, p2);
            System.out.println(arrayToString(result));
            `;
        } else {
            executionCall = `
            Solution sol = new Solution();
            var result = sol.${config.method}(p1, p2);
            System.out.println(result);
            `;
        }
        helperMethods += arrayHelpers;
        break;
    }

    return `
import java.util.*;
import java.io.*;
import java.util.stream.*;

${sanitizedCode}

class Main {
    public static void main(String[] args) throws IOException {
        ${parsingLogic}
        ${executionCall}
    }
    
    ${helperMethods}
}
    `.trim().replace(/\r/g, "");
  }
  // C++ (GCC 9.2.0) Wrapper
  if (languageId === "54") {
    let parsingLogic = `
    string line;
    getline(cin, line);
    `;
    let executionCall = "";
    let helperFunctions = `
    // Helper to print vector
    void printVector(const vector<string>& v) {
        cout << "[";
        for(size_t i = 0; i < v.size(); ++i) {
            cout << "\\"" << v[i] << "\\"";
            if(i < v.size() - 1) cout << ",";
        }
        cout << "]";
    }
    
    // Helper to print int vector
    void printIntVector(const vector<int>& v) {
        cout << "[";
        for(size_t i = 0; i < v.size(); ++i) {
            cout << v[i];
            if(i < v.size() - 1) cout << ",";
        }
        cout << "]";
    }

    // Helper to parse int array from string "[1,2,3]"
    vector<int> parseIntArray(string s) {
        vector<int> res;
        if(s.length() < 2) return res;
        s = s.substr(1, s.length() - 2);
        stringstream ss(s);
        string item;
        while(getline(ss, item, ',')) {
           if(!item.empty()) res.push_back(stoi(item));
        }
        return res;
    }
    `;

    switch (config.inputType) {
        case "string":
             // Remove surrounding quotes if present
             parsingLogic += `
             if(!line.empty() && line.front() == '"' && line.back() == '"') {
                 line = line.substr(1, line.size() - 2);
             }
             string arg = line;
             `;
             if (config.outputType === "array") {
                 executionCall = `
                 Solution sol;
                 vector<string> result = sol.${config.method}(arg);
                 printVector(result);
                 `;
             } else {
                 executionCall = `
                 Solution sol;
                 auto result = sol.${config.method}(arg);
                 cout << result;
                 `;
             }
             break;
        case "int":
             parsingLogic += `
             int arg = stoi(line);
             `;
             executionCall = `
             Solution sol;
             auto result = sol.${config.method}(arg);
             cout << (result ? "true" : "false"); // Assuming boolean output for simple int inputs mostly
             `;
             // Adjust if output is int
             if (config.outputType !== "boolean") {
                  executionCall = `
                 Solution sol;
                 auto result = sol.${config.method}(arg);
                 cout << result;
                 `;
             }
             break;
        case "array":
             parsingLogic += `
             vector<int> arg = parseIntArray(line);
             `;
             if (config.outputType === "array") {
                 executionCall = `
                 Solution sol;
                 vector<int> result = sol.${config.method}(arg);
                 printIntVector(result);
                 `;
             } else if (config.outputType === "boolean") {
                 executionCall = `
                 Solution sol;
                 bool result = sol.${config.method}(arg);
                 cout << (result ? "true" : "false");
                 `;
             } else if (config.outputType === "void") {
                  executionCall = `
                 Solution sol;
                 sol.${config.method}(arg);
                 printIntVector(arg);
                 `;
             } else {
                 executionCall = `
                 Solution sol;
                 cout << sol.${config.method}(arg);
                 `;
             }
             break;
        case "two_args_arr_int":
             parsingLogic = `
             // line has first arg
             string line2;
             getline(cin, line2);
             vector<int> p1 = parseIntArray(line);
             int p2 = stoi(line2);
             `;
             if (config.outputType === "array") {
                  executionCall = `
                 Solution sol;
                 vector<int> result = sol.${config.method}(p1, p2);
                 printIntVector(result);
                 `;
             } else {
                  executionCall = `
                 Solution sol;
                 cout << sol.${config.method}(p1, p2); 
                 `;
             }
             break;
    }

    return `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <iterator>
#include <map>
#include <unordered_map>
#include <set>
#include <unordered_set>

using namespace std;

${code}

${helperFunctions}

int main() {
    ${parsingLogic}
    ${executionCall}
    return 0;
}
    `;
  }

  return code.replace(/\r/g, "");
}
