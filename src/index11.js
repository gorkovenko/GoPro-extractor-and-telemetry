console.log('Hello Project.');
const gpmfExtract = require('gpmf-extract');
const goproTelemetry = require(`gopro-telemetry`);
const fs = require('fs');

const file = fs.readFileSync('GX010099.mp4');
console.log(file);
gpmfExtract(file)
  .then(extracted => {
    let telemetry = goproTelemetry(extracted);
    fs.writeFileSync('output_path.json', JSON.stringify(telemetry));
    console.log('Telemetry saved as JSON');
  })
  .catch(error => console.log(error));
