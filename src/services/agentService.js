import { createAgent, tool } from "langchain";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { z } from "zod";
import sqlite3 from "sqlite3";
import { promisify } from "util";
import model from "../config/azureOpenAI.js";
import db from "../database/db.js";

const executeQueryTool = tool(
    async ({ query }) => {
        const normalized = String(query ?? "")
            .trim()
            .toLowerCase();

        if (
            normalized.includes(" drop ") ||
            normalized.includes(" delete ") ||
            normalized.includes(" update ") ||
            normalized.includes(" insert ") ||
            normalized.includes(" alter ") ||
            normalized.includes(" create ") ||
            normalized.includes(" truncate ")
        ) {
            return "Error: Only read-only queries are allowed (SELECT/WITH/EXPLAIN/PRAGMA).";
        }
        const dbAllPromisified = promisify(db.all.bind(db));
        const rows = await dbAllPromisified(query, []);
        return JSON.stringify(rows);
    },
    {
        name: "execute_sql",
        description: "Execute a SQLite command and return results.",
        schema: z.object({ query: z.string() }),
    }
);

const prompt = new SystemMessage(
    `You are a helpful assistant that answers by querying a SQLite database.
    Use the executeDatabaseQuery tool for any database lookup.
    Use the database schema for find tables. All names are in english.
    Before execute the queries, retrieve the tables schemas to plan.
    Only run read-only SQL (SELECT/WITH/EXPLAIN/PRAGMA).
    If the user asks for non-read-only SQL, refuse.
    When needed, run multiple queries to gather enough information.
    Return a clear final answer to the user based on the tool results.`
);

const agent = createAgent({
    model: model,
    tools: [executeQueryTool],
    systemPrompt: prompt,
});

// Function to run the agent (keeps your original API shape)
export const runAgent = async (userPrompt) => {
    console.log("User prompt: ", userPrompt, "\n");

    const stream = await agent.stream({
        messages: [new HumanMessage(userPrompt)],
        streamMode: "values",
    });

    let response = "No response";
    let stepIndex = 1;

    for await (const step of stream) {
        const latestMessage =
            step.tools?.messages?.at(-1) ||
            step.model_request?.messages?.at(-1);

        if (latestMessage) {
            const name = latestMessage.name;
            if (latestMessage.content) {
                response = latestMessage.content;
            } else if (latestMessage.tool_calls) {
                response = JSON.stringify(latestMessage.tool_calls)
            }
            console.log(`Step ${stepIndex}:`);
            console.dir(`Caller: ${name}: ${response}`, { depth: null, colors: true })
            console.log("\n"); // Quebra de linha

        }
        stepIndex++;
    }

    return response;
};
