
import https from 'https';

const countries = ['kenya', 'angola', 'south-africa', 'nigeria'];

countries.forEach(country => {
  const url = `https://mapsvg.com/maps/geo-calibrated/${country}.svg`;
  https.get(url, (res) => {
    console.log(`${country}: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error(`${country} error: ` + err.message);
  });
});
