export const gameQuestions = [
  {
    id: 1,
    language: "JAVA",
    title: "Longest Valid Parentheses",
    difficulty: "HARD",
    timeLimit: "1s",
    memory: "256MB",
    description: "Given a string containing just the characters '(' and ')', return the length of the longest valid (well-formed) parentheses substring.",
    initialCode: `class Solution {
    public int longestValidParentheses(String s) {
        int maxans = 0;
        int dp[] = new int[s.length()];
        for (int i =0; i < s.length(); i++) {
            if (s.charAt(i) == ')') {
                if (s.charAt(i - 1) == '(') {
                    dp[i] = (i >= 2 ? dp[i - 2] : 0) + 2;
                } else if (i - dp[i - 1] > 0 && s.charAt(i - dp[i - 1] - 1) == '(') {
                    dp[i] = dp[i - 1] + ((i - dp[i - 1] >= 2) ? dp[i - dp[i - 1] - 2] : 0) + 2;
                }
                maxans = Math.max(maxans, dp[i]);
            }
        }
        return maxans;
    }
}`,
    correctCode: `class Solution {
    public int longestValidParentheses(String s) {
        int maxans = 0;
        int dp[] = new int[s.length()];
        for (int i =1; i < s.length(); i++) {
            if (s.charAt(i) == ')') {
                if (s.charAt(i - 1) == '(') {
                    dp[i] = (i >= 2 ? dp[i - 2] : 0) + 2;
                } else if (i - dp[i - 1] > 0 && s.charAt(i - dp[i - 1] - 1) == '(') {
                    dp[i] = dp[i - 1] + ((i - dp[i - 1] >= 2) ? dp[i - dp[i - 1] - 2] : 0) + 2;
                }
                maxans = Math.max(maxans, dp[i]);
            }
        }
        return maxans;
    }
}`,
    testCases: [
      { input: "\"(()\"", expected: "2" },
      { input: "\")()())\"", expected: "4" },
      { input: "\"\"", expected: "0" },
      { input: "\"(((())))\"", expected: "8" },
      { input: "\"()(()\"", expected: "2" },
      { input: "\")(\"", expected: "0" },
      { input: "\"()(())\"", expected: "6" },
      { input: "\"()()()()\"", expected: "8" },
      { input: "\"((()()()\"", expected: "6" },
      { input: "\")(((((()())()()))()(()))(\"", expected: "22" }
    ]
  },
  {
    id: 2,
    language: "C++",
    title: "Network Delay Time",
    difficulty: "HARD",
    timeLimit: "2s",
    memory: "256MB",
    description: "You are given a network of n nodes, labeled from 1 to n. You are given times, a list of travel times as directed edges times[i] = (u, v, w). We send a signal from a given node k. Return the minimum time it takes for all the n nodes to receive the signal. If it is impossible, return -1.",
    initialCode: `#include <vector>
#include <queue>
#include <climits>      
using namespace std;

class Solution {
public:
    int networkDelayTime(vector<vector<int>>& times, int n, int k) {
        vector<pair<int, int>> adj[n + 1];
        for (auto& t : times) adj[t[0]].push_back({t[1], t[2]});
        
        vector<int> dist(n + 1, INT_MAX);
        dist[k] = 0;
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
        pq.push({0, k});
        
        while (pq.empty()) {
            auto [d, u] = pq.top(); pq.pop();
            if (d > dist[u]) continue;
            for (auto& edge : adj[u]) {
                int v = edge.first, w = edge.second;
                if (dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                    pq.push({dist[v], v});
                }
            }
        }
        
        int ans = 0;
        for (int i = 1; i <= n; i++) {
            if (dist[i] == INT_MAX) return -1;
            ans = max(ans, dist[i]);
        }
        return ans;
    }
};`,
    correctCode: `#include <vector>
#include <queue>
#include <climits>      
using namespace std;

class Solution {
public:
    int networkDelayTime(vector<vector<int>>& times, int n, int k) {
        vector<pair<int, int>> adj[n + 1];
        for (auto& t : times) adj[t[0]].push_back({t[1], t[2]});
        
        vector<int> dist(n + 1, INT_MAX);
        dist[k] = 0;
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
        pq.push({0, k});
        
        while (!pq.empty()) {
            auto [d, u] = pq.top(); pq.pop();
            if (d > dist[u]) continue;
            for (auto& edge : adj[u]) {
                int v = edge.first, w = edge.second;
                if (dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                    pq.push({dist[v], v});
                }
            }
        }
        
        int ans = 0;
        for (int i = 1; i <= n; i++) {
            if (dist[i] == INT_MAX) return -1;
            ans = max(ans, dist[i]);
        }
        return ans;
    }
};`,
    testCases: [
      { input: "[[2,1,1],[2,3,1],[3,4,1]], n=4, k=2", expected: "2" },
      { input: "[[1,2,1]], n=2, k=1", expected: "1" },
      { input: "[[1,2,1]], n=2, k=2", expected: "-1" },
      { input: "[[1,2,5],[1,3,2],[3,2,1]], n=3, k=1", expected: "3" },
      { input: "[[1,2,8],[2,3,5],[1,3,15]], n=3, k=1", expected: "13" },
      { input: "[[1,2,1],[2,3,1],[3,4,1],[4,5,1]], n=5, k=1", expected: "4" },
      { input: "[[1,2,1],[2,1,3]], n=2, k=2", expected: "3" },
      { input: "[[1,2,10],[1,3,10],[2,4,10],[3,4,10]], n=4, k=1", expected: "20" },
      { input: "[[2,1,1],[2,3,1],[3,4,1]], n=4, k=1", expected: "-1" },
      { input: "[[1,2,1],[1,3,2],[1,4,3],[1,5,4]], n=5, k=1", expected: "4" }
    ]
  },
  {
    id: 3,
    language: "PYTHON 3",
    title: "Trapping Rain Water",
    difficulty: "HARD",
    timeLimit: "1s",
    memory: "256MB",
    description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining. Implement the O(1) memory two-pointer approach.",
    initialCode: `class Solution:
    def trap(self, height: list[int]) -> int:
        if not height: return 0
        left, right = 0, len(height)
        left_max, right_max = height[left], height[right - 1]
        water = 0
        
        while left <= right:
            if left_max > right_max:
                left += 1
                left_max = max(left_max, height[left])
                water += left_max - height[left]
            else:
                right -= 1
                right_max = max(right_max, height[right])
                water += right_max - height[right]
                
        return water`,
    correctCode: `class Solution:
    def trap(self, height: list[int]) -> int:
        if not height: return 0
        left, right = 0, len(height) - 1
        left_max, right_max = height[left], height[right]
        water = 0
        
        while left < right:
            if left_max < right_max:
                left += 1
                left_max = max(left_max, height[left])
                water += left_max - height[left]
            else:
                right -= 1
                right_max = max(right_max, height[right])
                water += right_max - height[right]
                
        return water`,
    testCases: [
      { input: "[0,1,0,2,1,0,1,3,2,1,2,1]", expected: "6" },
      { input: "[4,2,0,3,2,5]", expected: "9" },
      { input: "[1,0,1]", expected: "1" },
      { input: "[0,0,0,0]", expected: "0" },
      { input: "[5,4,3,2,1]", expected: "0" },
      { input: "[1,2,3,4,5]", expected: "0" },
      { input: "[5,0,5,0,5]", expected: "10" },
      { input: "[3,0,0,2,0,4]", expected: "10" },
      { input: "[2,0,2]", expected: "2" },
      { input: "[4,2,3]", expected: "1" }
    ]
  },
  {
    id: 4,
    language: "GOLANG",
    title: "Minimum Window Substring",
    difficulty: "VERY HARD",
    timeLimit: "1s",
    memory: "128MB",
    description: "Given two strings s and t of lengths m and n, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return an empty string.",
    initialCode: `func minWindow(s string, t string) string {
    if len(s) == 0 || len(t) == 0 { return "" }
    dictT := make(map[byte]int)
    for i := 0; i < len(t); i++ { dictT[t[i]]++ }
    
    required := len(t)
    l, r, formed := 0, 0, 0
    windowCounts := make(map[byte]int)
    ans := []int{-1, 0, 0}
    
    for r < len(s) {
        c := s[r]
        windowCounts[c]++
        if dictT[c] > 0 && windowCounts[c] >= dictT[c] { formed++ }
        
        for l < r && formed == required {
            c = s[l]
            if ans[0] == -1 || r-l+1 < ans[0] {
                ans[0] = r - l + 1
                ans[1] = l
                ans[2] = r
            }
            windowCounts[c]--
            if dictT[c] > 0 && windowCounts[c] <= dictT[c] { formed-- }
            l++
        }
        r++
    }
    if ans[0] == -1 { return "" }
    return s[ans[1] : ans[2]+1]
}`,
    correctCode: `func minWindow(s string, t string) string {
    if len(s) == 0 || len(t) == 0 { return "" }
    dictT := make(map[byte]int)
    for i := 0; i < len(t); i++ { dictT[t[i]]++ }
    
    required := len(dictT)
    l, r, formed := 0, 0, 0
    windowCounts := make(map[byte]int)
    ans := []int{-1, 0, 0}
    
    for r < len(s) {
        c := s[r]
        windowCounts[c]++
        if dictT[c] > 0 && windowCounts[c] == dictT[c] { formed++ }
        
        for l <= r && formed == required {
            c = s[l]
            if ans[0] == -1 || r-l+1 < ans[0] {
                ans[0] = r - l + 1
                ans[1] = l
                ans[2] = r
            }
            windowCounts[c]--
            if dictT[c] > 0 && windowCounts[c] < dictT[c] { formed-- }
            l++
        }
        r++
    }
    if ans[0] == -1 { return "" }
    return s[ans[1] : ans[2]+1]
}`,
    testCases: [
      { input: "s = \"ADOBECODEBANC\", t = \"ABC\"", expected: "\"BANC\"" },
      { input: "s = \"a\", t = \"a\"", expected: "\"a\"" },
      { input: "s = \"a\", t = \"aa\"", expected: "\"\"" },
      { input: "s = \"aa\", t = \"a\"", expected: "\"a\"" },
      { input: "s = \"bbaa\", t = \"aba\"", expected: "\"baa\"" },
      { input: "s = \"ab\", t = \"b\"", expected: "\"b\"" },
      { input: "s = \"cbaebabacd\", t = \"abc\"", expected: "\"cba\"" },
      { input: "s = \"aaaaaaaaaaaabbbbbcdd\", t = \"abcdd\"", expected: "\"abbbbbcdd\"" },
      { input: "s = \"xzyzzyx\", t = \"xyz\"", expected: "\"xzy\"" },
      { input: "s = \"abcdefg\", t = \"g\"", expected: "\"g\"" }
    ]
  },
  {
    id: 5,
    language: "JAVASCRIPT",
    title: "Word Break",
    difficulty: "HARD",
    timeLimit: "1s",
    memory: "128MB",
    description: "Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.",
    initialCode: `var wordBreak = function(s, wordDict) {
    const wordSet = new Set(wordDict);
    const dp = new Array(s.length).fill(false);
    dp[0] = true;
    
    for (let i = 1; i <= s.length; i++) {
        for (let j = 1; j < i; j++) {
            if (dp[j] || wordSet.has(s.substring(j, i))) {
                dp[i] = true;
                break;
            }
        }
    }
    return dp[s.length - 1];
};`,
    correctCode: `var wordBreak = function(s, wordDict) {
    const wordSet = new Set(wordDict);
    const dp = new Array(s.length + 1).fill(false);
    dp[0] = true;
    
    for (let i = 1; i <= s.length; i++) {
        for (let j = 0; j < i; j++) {
            if (dp[j] && wordSet.has(s.substring(j, i))) {
                dp[i] = true;
                break;
            }
        }
    }
    return dp[s.length];
};`,
    testCases: [
      { input: "s = \"leetcode\", dict = [\"leet\",\"code\"]", expected: "true" },
      { input: "s = \"applepenapple\", dict = [\"apple\",\"pen\"]", expected: "true" },
      { input: "s = \"catsandog\", dict = [\"cats\",\"dog\",\"sand\",\"and\",\"cat\"]", expected: "false" },
      { input: "s = \"a\", dict = [\"a\"]", expected: "true" },
      { input: "s = \"a\", dict = [\"b\"]", expected: "false" },
      { input: "s = \"bb\", dict = [\"a\",\"b\",\"bbb\",\"bbbb\"]", expected: "true" },
      { input: "s = \"cars\", dict = [\"car\",\"ca\",\"rs\"]", expected: "true" },
      { input: "s = \"cbca\", dict = [\"bc\",\"ca\"]", expected: "false" },
      { input: "s = \"aaaaaaa\", dict = [\"aaaa\",\"aaa\"]", expected: "true" },
      { input: "s = \"abcd\", dict = [\"a\",\"abc\",\"b\",\"cd\"]", expected: "true" }
    ]
  }
];