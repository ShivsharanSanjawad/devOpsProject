INSERT INTO problems (id, title, body, difficulty, time_limit_ms, memory_limit_mb, points, checker_type)
VALUES
(UUID(), 'Two Sum Variant', 'Given an integer array nums and an integer target, return the indices of two distinct elements whose sum equals target. If no such pair exists, return [-1, -1].', 'EASY', 2000, 256, 100, 'EXACT'),
(UUID(), 'Valid Parentheses Stream', 'Given a string containing only (), {}, and [], determine if the sequence is valid. A sequence is valid if every open bracket is closed in the correct order.', 'EASY', 2000, 256, 100, 'EXACT'),
(UUID(), 'Merge Overlapping Intervals', 'You are given a list of intervals [start, end]. Merge all overlapping intervals and return the resulting list sorted by start value.', 'MEDIUM', 2000, 256, 200, 'EXACT'),
(UUID(), 'Maximum Subarray Sum', 'Given an array of integers, find the contiguous subarray with the largest possible sum and return that sum.', 'MEDIUM', 2000, 256, 200, 'EXACT'),
(UUID(), 'Binary Search Position', 'Given a sorted array and a target value, return the index of the target if present, otherwise return the index where it should be inserted to keep the array sorted.', 'EASY', 1500, 256, 100, 'EXACT'),
(UUID(), 'K Closest Points to Origin', 'Given a list of points on a 2D plane, return the k points closest to the origin (0,0) using Euclidean distance.', 'MEDIUM', 2000, 256, 250, 'EXACT'),
(UUID(), 'Top K Frequent Elements', 'Given an integer array, return the k most frequent elements in any order.', 'MEDIUM', 2000, 256, 250, 'EXACT'),
(UUID(), 'Longest Non-Repeating Substring', 'Given a string, return the length of the longest substring without repeating characters.', 'MEDIUM', 2000, 256, 250, 'EXACT'),
(UUID(), 'Minimum Window Substring', 'Given strings s and t, find the smallest window in s that contains all characters of t (including multiplicity). Return empty string if no such window exists.', 'HARD', 3000, 256, 400, 'EXACT'),
(UUID(), 'Word Ladder Length', 'Given beginWord, endWord, and a dictionary, return the length of the shortest transformation sequence from beginWord to endWord where only one character can change at a time and every intermediate word must exist in dictionary.', 'HARD', 3000, 512, 450, 'EXACT'),
(UUID(), 'Trapping Rain Water', 'Given an elevation map represented as an array, compute how much water can be trapped after raining.', 'HARD', 3000, 256, 400, 'EXACT'),
(UUID(), 'LRU Cache Design', 'Design an LRU cache supporting get(key) and put(key, value) in average O(1) time. Evict the least recently used entry when capacity is exceeded.', 'HARD', 3000, 512, 500, 'EXACT');
