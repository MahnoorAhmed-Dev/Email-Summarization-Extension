// Background script listens for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "summarizePage") {
        summarizePageContent(request.content, sendResponse);
    }
    return true;  // Keep the message channel open for async response
});

// Function to summarize the page content
async function summarizePageContent(pageContent, sendResponse) {
    try {
        const chat_prompt = [
            {
                "role": "system",
                "content": `You are an AI that summarizes webpage content in a concise and clear manner. Summarize the content in bullet points, including key details such as the date, time, event title, and any important actions or links. If the content is an email invitation, include important details like the subject, sender, event time, and action items. Use bullet points for each detail.`
            },
            {
                "role": "user",
                "content": pageContent
            }
        ];

        const endpoint = "https://ragresume.openai.azure.com/openai/deployments/gpt-35-turbo/chat/completions?api-version=2023-05-15";
        const api_key = "CGkgIclvaY0fdnq6eQUaLuBeZgeWspqSf4hhD8ohh7mf7zMCQb2SJQQJ99AKACYeBjFXJ3w3AAABACOG1etF";

        // Call your Azure OpenAI endpoint to generate a summary
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': api_key
            },
            body: JSON.stringify({
                messages: chat_prompt,
                max_tokens: 500,
                temperature: 0.3
            })
        });

        // Check if the response is successful
        if (response.ok) {
            const data = await response.json();
            if (data.choices && data.choices.length > 0) {
                const summary = data.choices[0].message.content;
                sendResponse({ action: "summaryResponse", summary: summary });
            } else {
                sendResponse({ action: "summaryResponse", summary: "No summary generated." });
            }
        } else {
            const errorData = await response.text();  // Get the error details from the response
            console.error('Error fetching data from Azure OpenAI:', errorData);
            sendResponse({ action: "summaryResponse", summary: "Failed to generate summary." });
        }
    } catch (error) {
        console.error('Error during summarization:', error);
        sendResponse({ action: "summaryResponse", summary: "An error occurred while generating the summary." });
    }
}
