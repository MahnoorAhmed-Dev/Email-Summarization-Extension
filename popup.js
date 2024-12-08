document.addEventListener("DOMContentLoaded", function () {
    const summarizeButton = document.getElementById("summarizeButton");
    const summaryDiv = document.getElementById("summaryOutput");

    summarizeButton.addEventListener("click", () => {
        // Get the current active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs[0]) {
                // Execute a script in the current tab to extract the entire page content
                chrome.scripting.executeScript(
                    {
                        target: { tabId: tabs[0].id },
                        func: () => document.body.innerText  // Extracts all the text content from the page
                    },
                    (result) => {
                        if (chrome.runtime.lastError) {
                            console.error(chrome.runtime.lastError);
                        } else {
                            const pageContent = result[0].result; // Extracted page content
                            // Send the page content to background.js for summarization
                            chrome.runtime.sendMessage({ action: "summarizePage", content: pageContent }, (response) => {
                                if (response && response.action === "summaryResponse") {
                                    if (response.summary) {
                                        summaryDiv.textContent = response.summary;  // Display the summary
                                    } else {
                                        summaryDiv.textContent = "Error: Unable to summarize the page.";
                                    }
                                }
                            });
                        }
                    }
                );
            }
        });
    });
});
