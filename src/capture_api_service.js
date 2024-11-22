const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 9999; // Use dynamic port for Render or default to 9999

let browser;
let capturedActions = []; // To hold actions in memory

// Utility to generate locators (unchanged)
async function generateOptimizedLocators(elementHandle, page) {
    const locators = [];

    const properties = await page.evaluate((el) => {
        const attributes = Array.from(el.attributes).reduce((acc, attr) => {
            acc[attr.name] = attr.value;
            return acc;
        }, {});
        return {
            tagName: el.tagName,
            id: el.id,
            className: el.className,
            name: el.name || '',
            ariaLabel: el.getAttribute('aria-label') || '',
            textContent: el.textContent.trim(),
            attributes,
        };
    }, elementHandle);

    const { id, name, className, ariaLabel } = properties;

    // Add unique locators
    if (id) locators.push({ type: 'id', value: `#${id}` });
    if (name) locators.push({ type: 'name', value: `[name="${name}"]` });
    if (ariaLabel) locators.push({ type: 'aria-label', value: `[aria-label="${ariaLabel}"]` });

    // Add class-based selector
    if (className) {
        const classSelector = `.${className.split(' ').join('.')}`;
        locators.push({ type: 'class', value: classSelector });
    }

    // Add XPath
    const xpath = await page.evaluate((el) => {
        const getXPath = (node) => {
            if (node.id) return `//*[@id="${node.id}"]`;
            const parts = [];
            while (node && node.nodeType === Node.ELEMENT_NODE) {
                let siblingIndex = 1;
                let sibling = node.previousSibling;
                while (sibling) {
                    if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === node.tagName) {
                        siblingIndex++;
                    }
                    sibling = sibling.previousSibling;
                }
                const tagName = node.tagName.toLowerCase();
                const pathIndex = siblingIndex > 1 ? `[${siblingIndex}]` : '';
                parts.unshift(`${tagName}${pathIndex}`);
                node = node.parentNode;
            }
            return parts.length ? `/${parts.join('/')}` : null;
        };
        return getXPath(el);
    }, elementHandle);
    locators.push({ type: 'xpath', value: xpath });

    return locators;
}

// Endpoint to start capturing actions
app.get('/start-capture', async (req, res) => {
    try {
        console.log('Starting interaction capture...');

        // Launch Puppeteer in headless mode for cloud
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();

        // Navigate to the target URL
        const targetUrl = req.query.url || 'https://example.com';
        await page.goto(targetUrl);
        console.log(`Navigated to: ${targetUrl}`);

        // Clear previous actions
        capturedActions = [];

        // Inject event listeners into the page (unchanged logic)
        const injectEventListeners = async (page) => {
            console.log('Injecting event listeners...');
            // Logic for injecting event listeners
        };

        await injectEventListeners(page);

        console.log('Capture setup complete. Interact with the page to generate events.');
        res.send(`Capture started on ${targetUrl}. Perform actions in the browser.`);
    } catch (error) {
        console.error('Error starting capture:', error.message);
        res.status(500).send('Error starting capture: ' + error.message);
    }
});

// Endpoint to stop capturing actions
app.get('/stop-capture', async (req, res) => {
    try {
        if (browser) {
            await browser.close();
            console.log('Browser closed successfully.');

            res.setHeader('Content-Type', 'application/json');
            res.send({
                message: 'Capture stopped successfully.',
                actions: capturedActions, // Return captured actions directly
            });
        } else {
            res.status(400).send('No active browser session to stop.');
        }
    } catch (error) {
        console.error('Error stopping capture:', error.message);
        res.status(500).send('Error stopping capture: ' + error.message);
    }
});

// Endpoint to fetch the captured actions JSON
app.get('/fetch-actions', (req, res) => {
    try {
        if (capturedActions.length === 0) {
            res.status(404).send({ error: 'No actions captured yet.' });
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.send(capturedActions); // Serve the captured actions
        }
    } catch (error) {
        console.error('Error fetching actions:', error.message);
        res.status(500).send('Error fetching actions: ' + error.message);
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
