console.log('Hello Project.');
const gpmfExtract = require('gpmf-extract');
const goproTelemetry = require(`gopro-telemetry`);
const fs = require('fs');

const file = fs.readFileSync('karma.MP4');
console.log(file);
gpmfExtract(file)
  .then(extracted => {
    let telemetry = goproTelemetry(extracted);
    console.log("Device Name: " + telemetry['1']['device name']);

    // How often do we want updates (in milliseconds)
    rate = 50

    // Which streams do we want to pull out
    stream_names = ["ACCL","GYRO","CORI"]
    // Which one do we use for timing information?
    time_stream = 'ACCL'

    //Set up an index into each stream, and variables to keep track of where we are
    stream_indexes = {}
    stream_names.forEach(function(s) { stream_indexes[s] = 0 } );
    target_time = 0
    running = true

    // Keep looping, till we run out of stuff
    while(running) {
      // Increase the target time
      target_time += rate
      // Composite data object - this would go in the database
      composite = {}

      // Go through each stream of interest, looking for the next sensor reading
      // before the target time value
      Object.keys(stream_indexes).forEach(function(stream) {
        //Get the current index in that stream (each stream is an Array)
        index = stream_indexes[stream]
        //Get the stream data
        data = telemetry['1']['streams'][stream]['samples']

        stream_time = 0
        // Work through the stream from the current index until the time (cts) is
        // larger than the target_time
        while( stream_time <= target_time ) {
          //If we've gone off the end of the stream, then stop looking at it
          if( index >= data.length ) {
            //...and if it's the stream we are using for timing info, stop the whole process
            if( stream === time_stream ) {
              console.log("Stopping at index " + index + ", current time: " + target_time );
              running = false;
            }
            break;
          }
          //Get the time from the stream
          stream_time = data[index]['cts']
          // If it's before the target, add the data into our final object
          if( stream_time <= target_time ) {
            composite[stream] = data[index]['value']
            //And if it's the stream we are using for time indexing, get the time info out of it
            if( stream === time_stream ) {
              console.log("Index: "+index+", current time: " + target_time + ", CTS: " + data[index]['cts'])
              composite['time'] = data[index]['time']
              composite['cts'] = data[index]['cts']
            }
            index++
          }
          else { break }
        }
        stream_indexes[stream] = index
      });
      console.log("Update: " + JSON.stringify(composite))
    }

  })
  .catch(error => console.log(error));
