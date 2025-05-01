const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/members/verify/MEM-123-test',
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      // Try to parse as JSON
      const jsonData = JSON.parse(data);
      console.log('Response as JSON:', jsonData);
    } catch (e) {
      // If not JSON, output as text
      console.log('Response (not JSON):', data.substring(0, 500) + '...');
    }
  });
});

req.on('error', (error) => {
  console.error('Error testing API:', error);
});

req.end();