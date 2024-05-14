const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const accessLogStream = fs.createWriteStream('./access.log', { flags: 'a' });

app.get('/test-api', async (req, res) => {
    const apiUrl = req.query.url;

    if (!apiUrl) {
        return res.status(400).json({ error: 'API URL is required' });
    }

    try {
        const response = await axios.get(apiUrl);
        const responseData = response.data;
        const log = {
            timestamp: new Date().toISOString(),
            url: apiUrl,
            status: response.status,
            data: responseData,
        };

        // Save log to file
        accessLogStream.write(JSON.stringify(log) + '\n');

        // Broadcast log to connected WebSocket clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(log));
            }
        });

        res.status(200).json({ status: response.status });
    } catch (error) {
        console.error('Error testing API:', error);
        res.status(500).json({ error: 'Error testing API' });
    }
});

server.listen(5000, () => {
    console.log('WebSocket server running on port 5000');
});
