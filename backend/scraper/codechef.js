const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Add stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

class CodeChefProblemTracker {
    constructor(username) {
        this.username = username;
        this.baseUrl = 'https://www.codechef.com';
    }

    async fetchRecentActivity() {
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

            // Extract recent activity using more flexible selector
            const recentActivity = await page.evaluate(() => {
                // Select the table with recent activity
                const table = document.querySelector('div.widget.recent-activity table');
                
                if (!table) return [];

                // Convert table rows to an array of activity details
                const rows = Array.from(table.querySelectorAll('tbody tr'));
                return rows.map(row => {
                    const columns = row.querySelectorAll('td');
                    if (columns.length >= 4) {
                        return {
                            time: columns[0].textContent.trim(),
                            problem: columns[1].textContent.trim(),
                            result: columns[2].textContent.trim(),
                            language: columns[3].textContent.trim(),
                            solution: columns[4] ? columns[4].textContent.trim() : ''
                        };
                    }
                    return null;
                }).filter(activity => activity !== null);
            });

            return recentActivity;
        } catch (error) {
            console.error('Error fetching recent activity:', error);
            return [];
        } finally {
            // Always close the browser
            if (browser) await browser.close();
        }
    }

    async generateActivityReport() {
        try {
            const recentActivity = await this.fetchRecentActivity();
            
            if (recentActivity.length === 0) {
                console.log('No recent activity found or unable to fetch activities.');
                return;
            }

            console.log('Recent Activity:');
            recentActivity.forEach(activity => {
                console.log(`Time: ${activity.time}`);
                console.log(`Problem: ${activity.problem}`);
                console.log(`Result: ${activity.result}`);
                console.log(`Language: ${activity.language}`);
                console.log(`Solution: ${activity.solution}`);
                console.log('---');
            });

            return recentActivity;
        } catch (error) {
            console.error('Error generating activity report:', error.message);
            return [];
        }
    }
}

// Usage Example
async function main() {
    const username = 'devendra_66';
    const problemTracker = new CodeChefProblemTracker(username);
    
    try {
        await problemTracker.generateActivityReport();
    } catch (error) {
        console.error('Main execution error:', error);
    }
}

// Export the class
module.exports = CodeChefProblemTracker;

// Immediate execution
main();