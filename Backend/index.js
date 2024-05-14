// dependencies
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const accessLogPath = path.join(__dirname, './logs/access.log');

//Appending Logs to logs folder named as access.log
const accessLogStream = fs.createWriteStream('./logs/access.log', { flags: 'a' });


//Mapping Status Code
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
    const method = req.method;
    const url = req.originalUrl || req.url;
    const userAgent = req.headers['user-agent'];

    const data = {
        level: statusCategory,
        method: method,
        url: url,
        timestamp: new Date().toISOString(),
        userAgent: userAgent,
        requestSent: true, // Indicate that the request was sent successfully
    };
    return JSON.stringify(data);
});

// Use CORS middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));


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

        // Log the successful result
        const logData = {
            level: 'success',
            method: 'GET',
            url: apiUrl,
            timestamp: new Date().toISOString(),
            userAgent: req.headers['user-agent'],
            requestSent: true,
            result: response.data,
        };
        accessLogStream.write(JSON.stringify(logData) + '\n');

        res.status(200).json({ status: status });
    } catch (error) {
        console.error('Error testing API:', error);

        // Log the error
        const logData = {
            level: 'error',
            method: 'GET',
            url: apiUrl,
            timestamp: new Date().toISOString(),
            userAgent: req.headers['user-agent'],
            requestSent: false,
            error: error.message,
        };
        accessLogStream.write(JSON.stringify(logData) + '\n');

        res.status(500).json({ error: 'Error testing API' });
    }
});

// Endpoint to fetch logs for Query Interface
app.get('/logs', (req, res) => {
    const logs = fs.readFileSync(accessLogPath, 'utf8').split('\n').filter(line => line.trim() !== '').map(JSON.parse);
    res.json(logs);
});


app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
