const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Add stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

class CodeChefProblemTracker {
    constructor(username) {
        this.username = username;
        this.baseUrl = 'https://www.codechef.com';
    }

    async fetchUniqueSolvedProblems() {
        let browser = null;
        try {
            // Launch the browser with more flexible options
            browser = await puppeteer.launch({ 
                headless: 'new', 
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage'
                ]
            });

            // Create a new page
            const page = await browser.newPage();

            // Set user agent to mimic a real browser
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

            // Navigate to the user's profile
            await page.goto(`${this.baseUrl}/users/${this.username}`, { 
                waitUntil: 'networkidle0',
                timeout: 60000 // 60 seconds timeout
            });

            // Extract unique solved problems
            const solvedProblems = await page.evaluate(() => {
                // Select the table with recent activity
                const table = document.querySelector('div.widget.recent-activity table');
                
                if (!table) return [];

                // Convert table rows to an array of unique problem details
                const rows = Array.from(table.querySelectorAll('tbody tr'));
                const uniqueProblems = new Map();

                rows.forEach(row => {
                    const columns = row.querySelectorAll('td');
                    if (columns.length >= 4) {
                        const time = columns[0].textContent.trim();
                        const problem = columns[1].textContent.trim();

                        // Only add if not already in the map
                        if (!uniqueProblems.has(problem)) {
                            uniqueProblems.set(problem, time);
                        }
                    }
                });

                // Convert map to array of objects
                return Array.from(uniqueProblems, ([problemName, submissionTime]) => ({
                    problemName,
                    submissionTime
                }));
            });

            return {
                totalUniqueProblemsSolved: solvedProblems.length,
                problems: solvedProblems
            };
        } catch (error) {
            console.error('Error fetching unique solved problems:', error);
            return { totalUniqueProblemsSolved: 0, problems: [] };
        } finally {
            // Always close the browser
            if (browser) await browser.close();
        }
    }

    async generateProblemReport() {
        try {
            const { totalUniqueProblemsSolved, problems } = await this.fetchUniqueSolvedProblems();
            
            console.log(`Total Unique Problems Solved: ${totalUniqueProblemsSolved}`);
            
            problems.forEach((problem, index) => {
                console.log(`Problem ${index + 1}:`);
                console.log(`Name: ${problem.problemName}`);
                console.log(`Submission Time: ${problem.submissionTime}`);
                console.log('---');
            });

            return { totalUniqueProblemsSolved, problems };
        } catch (error) {
            console.error('Error generating problem report:', error.message);
            return { totalUniqueProblemsSolved: 0, problems: [] };
        }
    }
}

// Usage Example
async function main() {
    const username = 'devendra_66';
    const problemTracker = new CodeChefProblemTracker(username);
    
    try {
        await problemTracker.generateProblemReport();
    } catch (error) {
        console.error('Main execution error:', error);
    }
}

// Export the class
module.exports = CodeChefProblemTracker;

// Immediate execution
main();