console.log('Hello Project.');
const gpmfExtract = require('gpmf-extract');
const goproTelemetry = require(`gopro-telemetry`);
const fs = require('fs');

const file = fs.readFileSync('GH010053.MP4');
console.log(file);
gpmfExtract(file)
  .then(extracted => {
    let telemetry = goproTelemetry(extracted);
    // Structure is that there's one top level key '1' with most of the stuff in
    Object.keys(telemetry).forEach(function(key) { console.log("top_level: "+key ); });
    // There's one key outside that:
    console.log("Frames per second: " + telemetry['frames/second']);
    // Within the main element, there's a 'device name' key:
    Object.keys(telemetry['1']).forEach(function(key) { console.log("1: " + key ); });
    console.log("Device Name: " + telemetry['1']['device name']);


    //Other good sensors:
    //SCEN - scene classification
    //GRAV - gravity vector
    //
    sensors_of_interest = ["ACCL","GYRO","CORI"]
    // And everything else is in a 'streams' key:
    //Object.keys(telemetry['1']['streams']).forEach(function(stream) {
    sensors_of_interest.forEach(function(stream) {
      console.log("STREAM [" + stream  +'] ' +
        telemetry['1']['streams'][stream]['name'] +" (" +telemetry['1']['streams'][stream]['units']
      );
      // Then it is an array (maybe) or at least keyed by integers
      //Object.keys(telemetry['1']['streams'][stream]['samples']).forEach(function(key) { console.log(">> "+key); })
      for( i = 0; i < 10; i++ ) {
      console.log(">> " + i + " " + JSON.stringify(telemetry['1']['streams'][stream]['samples'][i]))
      }
      //Object.keys(telemetry['1']['streams'][key]).forEach(function(key) { console.log("ACCL: " + key ); });
    });

    fs.writeFileSync('output_path.json', JSON.stringify(telemetry));
    console.log('Telemetry saved as JSON');
  })
  .catch(error => console.log(error));
