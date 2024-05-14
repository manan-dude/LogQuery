import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Import CSS file for styling


//Integrated 9 APIs for testing
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
  const [savelogs, setsaveLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedWindow, setSelectedWindow] = useState('apiTest'); // State to manage selected window
  const [filters, setFilters] = useState({
    level: '',
    fromDate: '',
    fromTime: '',
    toDate: '',
    toTime: '',
    regex: ''
  });

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
      await axios.get(`/test-api?url=${encodeURIComponent(apiUrl)}`);

    } catch (error) {
      console.error('Error making API request:', error);
    }
  };

  useEffect(() => {
    // Fetch logs when component mounts
    fetchLogs();
  }, []);

  useEffect(() => {
    // Apply filters when 'logs' or 'filters' change
    applyFilters();
  }, [logs, filters]);

  const fetchLogs = async () => {
    try {
      //fetching the saved APIs
      const response = await axios.get('/logs');
      setsaveLogs(response.data); // Update logs state with fetched logs
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const applyFilters = () => {
    // Filter logs based on the current filters
    let filtered = [...savelogs];

    // Filter by level
    if (filters.level) {
      filtered = filtered.filter((log) => log.level === filters.level);
    }

    // Filter by date range including time
    if (filters.fromDate && filters.toDate) {
      filtered = filtered.filter((log) => {
        const logTimestamp = new Date(log.timestamp);
        const fromDateTime = new Date(filters.fromDate + 'T' + filters.fromTime);
        const toDateTime = new Date(filters.toDate + 'T' + filters.toTime);

        // Compare timestamps with both date and time
        return (
          logTimestamp >= fromDateTime &&
          logTimestamp <= toDateTime
        );
      });
    }

    // Filter by regex pattern
    if (filters.regex) {
      const regex = new RegExp(filters.regex, 'i');
      filtered = filtered.filter((log) => regex.test(JSON.stringify(log)));
    }

    // Update filtered logs state
    setFilteredLogs(filtered);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters({ ...filters, [name]: value });
  };

  const renderApiTestWindow = () => (
    <div className="api-test-window">
      <h2>API Tester</h2>
      <div className="api-grid">
        {apiUrls.map((url, index) => (
          <button key={index} onClick={() => handleApiRequest(url)}>
            Test API {index + 1}
          </button>
        ))}
      </div>
      <div className="logs-container">
        <h3>Logs</h3>
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

  const renderQueryWindow = () => (
    <div className="query-window">
      <h2>Log Query</h2>
      <div className="filters">
      <label>
  Level:
  <select
    name="level"
    value={filters.level}
    onChange={handleFilterChange}
  >
    <option value="">All</option>
    <option value="info">Info</option>
    <option value="success">Success</option>
    <option value="error">Error</option>
  </select>
</label>

        <label>
          From Date:
          <input
            type="date"
            name="fromDate"
            value={filters.fromDate}
            onChange={handleFilterChange}
          />
          <input
            type="time"
            name="fromTime"
            value={filters.fromTime}
            onChange={handleFilterChange}
          />
        </label>
        <label>
          To Date:
          <input
            type="date"
            name="toDate"
            value={filters.toDate}
            onChange={handleFilterChange}
          />
          <input
            type="time"
            name="toTime"
            value={filters.toTime}
            onChange={handleFilterChange}
          />
        </label>
        <label>
          Regex Pattern:
          <input
            type="text"
            name="regex"
            value={filters.regex}
            onChange={handleFilterChange}
            placeholder='%u?'
          />
        </label>
      </div>
      <h3>Logs:</h3>
      <ul>
        {filteredLogs.map((logs, index) => (
          <li key={index} className="log-item">
            <pre className="log-data">{JSON.stringify(logs, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="app-container">
      <h1>Log Management System</h1>
      <div className="window-selector">
        <button onClick={() => setSelectedWindow('apiTest')}>API Test</button>
        <button onClick={() => setSelectedWindow('query')}>Log Query</button>
      </div>
      <div className="content">
        {selectedWindow === 'apiTest' && renderApiTestWindow()}
        {selectedWindow === 'query' && renderQueryWindow()}
      </div>
    </div>
  );
};

export default App;
