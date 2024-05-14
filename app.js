const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Create a write stream to log API statuses
const accessLogStream = fs.createWriteStream('./access.log', { flags: 'a' });

const statusCategories = {
    200: 'success',
    201: 'success',
    204: 'success',
    400: 'error',
    401: 'error',
    403: 'error',
    404: 'error',
    500: 'error',
    // Add more mappings as needed
};

// Define a custom token in morgan to log API status and metadata
morgan.token('logData', (req, res) => {
    const statusCode = res.statusCode;
    const statusCategory = statusCategories[statusCode] || 'info';

    const data = {
        level: statusCategory,
        url: req.originalUrl || req.url,
        timestamp: new Date().toISOString(),
        userAgent: req.headers['user-agent']
    };

    return JSON.stringify(data);
});

// Use CORS middleware
app.use(cors());

// Use morgan middleware with custom token to log API status and metadata
app.use(
    morgan(':logData', {
        stream: accessLogStream,
    })
);

// Test endpoint
app.get('/hi', (req, res) => {
    res.status(200).json({ message: 'Hello from API' });
});

// Endpoint to test an API and log its status
app.get('/test-api', async (req, res) => {
    const apiUrl = req.query.url;

    if (!apiUrl) {
        return res.status(400).json({ error: 'API URL is required' });
    }

    try {
        // Make a request to the specified API URL using axios
        const response = await axios.get(apiUrl);
        const status = response.status;
        res.status(200).json({ status: status });
    } catch (error) {
        console.error('Error testing API:', error);
        res.status(500).json({ error: 'Error testing API' });
    }
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
