const express = require("express");
// Ensure to install this if not already
const app = express();
const port = 3000;

// Utility function to simulate delay
const sleep = delay => {
    return new Promise(resolve => setTimeout(resolve, delay));
};

// Generate a random API key from the list
const apiKeys = [
    "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",
    "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",
    "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"
];
const getRandomApiKey = () =>
    apiKeys[Math.floor(Math.random() * apiKeys.length)];

// Generate a random job ID
const generateJobId = () => {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return (
        "j-" +
        Array.from(
            { length: 10 },
            () => characters[Math.floor(Math.random() * characters.length)]
        ).join("")
    );
};

// In-memory datastore for job descriptions
const dataStore = {
    superad: {
        description: "A beautiful girl from fairy tale",
        timestamp: Date.now()
    }
};

// Store job in the datastore
const storeJob = (id, description) => {
    dataStore[id] = {
        description,
        timestamp: Date.now()
    };
    console.log("New job created: " + id);

    // Automatically remove job after 90 seconds
    setTimeout(() => {
        console.log("Job removed: " + id);
        delete dataStore[id];
    }, 90000);
};

// Find a job by ID
const findJob = id => dataStore[id] || null;

// Generate an image using the Hugging Face API
const generateImage = async (prompt, job) => {
    const timestamp = new Date().toISOString();
    const modifiedPrompt = `${prompt} at ${timestamp}`;
    const genData = { inputs: modifiedPrompt };

    if (job !== "superad") {
        delete dataStore[job];
        console.log("Job removed: " + job);
    }

    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
            {
                headers: {
                    Authorization: `Bearer ${getRandomApiKey()}`,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(genData)
            }
        );

        if (!response.ok) {
            return { Error: response.status, Error_msg: response.statusText };
        }

        const buffer = await response.arrayBuffer();
        return {
            status: response.status,
            statusText: response.statusText,
            response: Buffer.from(buffer)
        };
    } catch (err) {
        console.error("Image generation error: ", err);
        throw err;
    }
};

// Endpoint to submit a job for image generation
app.get("/submit", async (req, res) => {
    const job = req.query.job;

    if (!job) {
        return res.status(400).json({ Error: "Job id required" });
    }

    const gPrompt = findJob(job);
    if (!gPrompt) {
        return res.status(400).json({ Error: "Job not found" });
    }

    console.log(`Submitted Job: ${job} | Description: ${gPrompt.description}`);

    const start = Date.now(); // Track start time

    try {
        const result = await generateImage(gPrompt.description, job);

        // If no result or if the result contains an error
        if (!result || result.Error) {
            const errorMsg = result
                ? `Image generation failed for job (${job}) with status: ${result.Error}, message: ${result.Error_msg}`
                : `Image generation failed for job (${job}) with an unknown error.`;

            console.error(errorMsg);
            return res.status(404).json({
                Error: result?.Error || "Unknown error",
                Error_msg: result?.Error_msg || "No response from API."
            });
        }

        // If we receive the image successfully
        res.type("image/jpeg");
        res.write(result.response);
        res.end();

        const timeTaken = (Date.now() - start) / 1000; // Calculate time taken
        console.log(
            `Job (${job}) successful. Time taken: ${timeTaken} seconds`
        );
    } catch (err) {
        // Catch any unexpected errors and ensure the server doesn't crash
        const timeTaken = (Date.now() - start) / 1000; // Still access the `start` variable
        console.error(
            `Unexpected error for job (${job}) after ${timeTaken} seconds:`,
            err
        );

        // Send a response with details from outside the catch
        return res.status(500).json({
            Error: "Image generation process encountered an unexpected error."
        });
    }
});

// Endpoint to create a new job
app.get("/job", async (req, res) => {
    const prompt = req.query.prompt;
    if (!prompt) {
        return res.status(400).json({ Error: "Prompt required" });
    }

    const jobId = generateJobId();
    storeJob(jobId, prompt);
    res.json({
        Job: jobId,
        message: "Task will be removed after 1 minute and 30 seconds"
    });

    const delay = Math.floor(Math.random() * 2000) + 5000; // Random delay between 5 and 7 seconds
    await sleep(delay);
});
app.get("/", (req, res) => {
    res.json({ job: "/job?prompt=..", submit: "/submit?job=..." });
});
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
