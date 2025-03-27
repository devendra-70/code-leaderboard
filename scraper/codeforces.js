const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Make this a direct class export
module.exports = class CodeforcesProblemTracker {
  constructor() {
    this.baseUrl = 'https://codeforces.com/api';
  }

  // Fetch user submissions with detailed timestamps
  async getUserSubmissions(username) {
    try {
      const response = await axios.get(`${this.baseUrl}/user.status`, {
        params: {
          handle: username,
          from: 1,
          count: 10000  // Fetch comprehensive submission history
        }
      });

      if (response.data.status !== 'OK') {
        throw new Error('Failed to fetch submissions');
      }

      // Process submissions
      const solvedProblems = new Map();

      response.data.result.forEach(submission => {
        if (submission.verdict === 'OK') {
          const problemKey = `${submission.problem.contestId}-${submission.problem.index}`;
          
          // Only store first successful submission for each unique problem
          if (!solvedProblems.has(problemKey)) {
            solvedProblems.set(problemKey, {
              problemId: problemKey,
              problemName: submission.problem.name,
              timestamp: submission.creationTimeSeconds,
              readableDate: new Date(submission.creationTimeSeconds * 1000).toISOString()
            });
          }
        }
      });

      return Array.from(solvedProblems.values());
    } catch (error) {
      console.error(`Error fetching submissions for ${username}:`, error.message);
      return [];
    }
  }

  // Save results to a JSON file
  saveSubmissionsToFile(username, submissions) {
    const outputDir = path.join(__dirname, 'output');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const outputFile = path.join(outputDir, `${username}_submissions.json`);
    
    fs.writeFileSync(outputFile, JSON.stringify(submissions, null, 2), 'utf8');
    console.log(`Submissions saved to ${outputFile}`);
  }
}