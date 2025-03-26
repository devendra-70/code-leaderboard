const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const puppeteer = require("puppeteer");

// GraphQL Schema
const schema = buildSchema(`
  type Query {
    leetcodeStats(username: String!): LeetCodeData
  }

  type LeetCodeData {
    username: String
    easy: String
    medium: String
    hard: String
  }
`);

// Scraping function with retries
async function scrapeLeetCode(username, retry = 1) {
    const url = `https://leetcode.com/${username}/`;
    const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
    const page = await browser.newPage();

    try {
        await page.goto(url, { waitUntil: "networkidle2", timeout: 15000 });

        // Wait for the statistics container to load
        await page.waitForSelector("div.flex.h-full.w-[90px].flex-none.flex-col.gap-2 > div:nth-child(1)", { timeout: 10000 });

        // Extract counts
        const counts = await page.evaluate(() => {
            const getText = (selector) => {
                const element = document.querySelector(selector);
                return element ? element.innerText.trim() : "Not Found";
            };

            return {
                easy: getText("div.flex.h-full.w-[90px].flex-none.flex-col.gap-2 > div:nth-child(1)"),
                medium: getText("div.flex.h-full.w-[90px].flex-none.flex-col.gap-2 > div:nth-child(2)"),
                hard: getText("div.flex.h-full.w-[90px].flex-none.flex-col.gap-2 > div:nth-child(3)"),
            };
        });

        await browser.close();
        return { username, ...counts };
    } catch (error) {
        console.error(`Error scraping LeetCode (Attempt ${retry}):`, error);
        await browser.close();

        // Retry scraping if first attempt fails (max 2 retries)
        if (retry < 2) {
            return scrapeLeetCode(username, retry + 1);
        }

        return { username, easy: "Error", medium: "Error", hard: "Error" };
    }
}

// GraphQL Resolver
const root = {
    leetcodeStats: async ({ username }) => {
        return await scrapeLeetCode(username);
    }
};

// Express GraphQL Server
const app = express();
app.use(
    "/graphql",
    graphqlHTTP({
        schema: schema,
        rootValue: root,
        graphiql: true,
    })
);

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`GraphQL Server running at http://localhost:${PORT}/graphql`);
});
