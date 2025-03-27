const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');

// New Endpoint: Full Leaderboard with Combined Problems Solved
router.get('/full', async (req, res) => {
  try {
    const leaderboard = await UserProfile.aggregate([
      // Match users with at least one platform username
      {
        $match: {
          $or: [
            { 'platforms.codechef.username': { $ne: null } },
            { 'platforms.leetcode.username': { $ne: null } },
            { 'platforms.codeforces.username': { $ne: null } }
          ]
        }
      },
      // Calculate total problems solved across all platforms
      {
        $addFields: {
          totalProblemsSolved: {
            $add: [
              { $ifNull: ['$platforms.codechef.problemsSolved', 0] },
              { $ifNull: ['$platforms.leetcode.problemsSolved', 0] },
              { $ifNull: ['$platforms.codeforces.problemsSolved', 0] }
            ]
          }
        }
      },
      // Project the required fields
      {
        $project: {
          username: 1,
          totalProblemsSolved: 1,
          platformDetails: {
            codechef: {
              username: '$platforms.codechef.username',
              problemsSolved: '$platforms.codechef.problemsSolved'
            },
            leetcode: {
              username: '$platforms.leetcode.username',
              problemsSolved: '$platforms.leetcode.problemsSolved'
            },
            codeforces: {
              username: '$platforms.codeforces.username',
              problemsSolved: '$platforms.codeforces.problemsSolved'
            }
          }
        }
      },
      // Sort by total problems solved in descending order
      {
        $sort: { totalProblemsSolved: -1 }
      },
      // Add ranking
      {
        $addFields: {
          rank: { $add: [{ $indexOfArray: [[], "$_id"] }, 1] }
        }
      }
    ]);

    // If no users found
    if (leaderboard.length === 0) {
      return res.status(404).json({ 
        message: 'No users found in the leaderboard' 
      });
    }

    res.json({
      totalUsers: leaderboard.length,
      leaderboard
    });
  } catch (error) {
    console.error('Full Leaderboard Error:', error);
    res.status(500).json({ 
      message: 'Error fetching full leaderboard', 
      error: error.message 
    });
  }
});

// Platform-based Leaderboard with Combined Problems Solved
router.get('/platform', async (req, res) => {
  try {
    const { platform } = req.query;

    // Validate platform
    const validPlatforms = ['codechef', 'leetcode', 'codeforces'];
    if (!platform || !validPlatforms.includes(platform)) {
      return res.status(400).json({ 
        message: 'Invalid or missing platform. Choose from: codechef, leetcode, codeforces' 
      });
    }

    const leaderboard = await UserProfile.aggregate([
      // Match users with a username for the specified platform
      {
        $match: {
          [`platforms.${platform}.username`]: { $ne: null }
        }
      },
      // Project the required fields
      {
        $project: {
          username: 1,
          platformUsername: `$platforms.${platform}.username`,
          problemsSolved: `$platforms.${platform}.problemsSolved`,
          lastUpdated: `$platforms.${platform}.lastUpdated`
        }
      },
      // Sort by problems solved in descending order
      {
        $sort: { problemsSolved: -1 }
      },
      // Add ranking
      {
        $addFields: {
          rank: { $add: [{ $indexOfArray: [[], "$_id"] }, 1] }
        }
      }
    ]);

    // If no users found for the platform
    if (leaderboard.length === 0) {
      return res.status(404).json({ 
        message: `No users found for platform: ${platform}` 
      });
    }

    res.json({
      platform,
      totalUsers: leaderboard.length,
      leaderboard
    });
  } catch (error) {
    console.error('Platform Leaderboard Error:', error);
    res.status(500).json({ 
      message: 'Error fetching platform leaderboard', 
      error: error.message 
    });
  }
});

module.exports = router;