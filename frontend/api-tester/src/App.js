import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css'; // Import CSS file for styling

const apiUrls = [
    'https://catfact.ninja/fact',
    'https://api.coindesk.com/v1/bpi/currentprice.json',
    'https://www.boredapi.com/api/activity',
    'https://api.agify.io?name=meelad',
    'https://api.genderize.io?name=luc',
    'https://api.nationalize.io?name=nathaniel',
    'https://datausa.io/api/data?drilldowns=Nation&measures=Population',
    'https://dog.ceo/api/breeds/image/random',
    'https://api.ipify.org?format=json'
];

const App = () => {
    const [logs, setLogs] = useState([]);

    const handleApiRequest = async (apiUrl) => {
        try {
            const response = await axios.get(apiUrl);
            const responseData = response.data;
            const log = {
                timestamp: new Date().toISOString(),
                url: apiUrl,
                status: response.status,
                data: responseData,
            };
            setLogs((prevLogs) => [...prevLogs, log]);

            // Log the API request to the backend
            await axios.get(`http://localhost:5000/test-api?url=${encodeURIComponent(apiUrl)}`);

        } catch (error) {
            console.error('Error making API request:', error);
        }
    };

    // Use useEffect to update logs when 'logs' state changes
    useEffect(() => {
        // Your logic here for any side effects related to 'logs'
        // This will run every time 'logs' changes
    }, [logs]);

    return (
        <div className="app-container">
            <h1>API Tester</h1>
            <div className="api-grid">
                {apiUrls.map((url, index) => (
                    <button key={index} onClick={() => handleApiRequest(url)}>
                        Test API {index + 1}
                    </button>
                ))}
            </div>
            <div className="logs-container">
                <h2>Logs</h2>
                <ul>
                    {logs.map((log, index) => (
                        <li key={index} className="log-item">
                            <div className="log-header">
                                <strong>{log.timestamp}</strong> - {log.url} - Status: {log.status}
                            </div>
                            <pre className="log-data">{JSON.stringify(log.data, null, 2)}</pre>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default App;
