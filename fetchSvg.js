import https from 'https';

const url = process.argv[2];

https.get(url, (res) => {
  console.error(`Status: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(data);
  });
}).on('error', (err) => {
  console.error('Error: ' + err.message);
});
