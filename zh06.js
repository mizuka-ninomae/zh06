const SerialPort = require('serialport');
const ByteLength = require('@serialport/parser-byte-length')
let   rdata      = new Uint8Array ();
let   value;
let   checksum   = 0;

class ZHZ06 {
  constructor (uart_path, callback) {
    const port      = new SerialPort (uart_path, {
                                      autoOpen: true,
                                      baudRate: 9600,
                                      dataBits: 8,
                                      parity:   'none',
                                      stopBits: 1
    });
    const parser    = port.pipe (new ByteLength ({length: 32}));

    port.on ("open", function () {
      if (require.main === module) {
        console.log (`ZHZ06 SerialPort: Open ('${uart_path}')`);
      }

      parser.on ("data", function (data) {
        rdata = data;
        port.close ();
      });

      port.on ("error", function (err) {
        port.close ();
        callback (`ZHZ06 SerialPort: error`, null, err);
      });

      port.on ("close", function () {
        if (require.main === module) {
          console.log (`ZHZ06 receive data: `, rdata);
          console.log (`ZHZ06 SerialPort: Close`);
        }
        if (rdata[0] == 66 && rdata[1] == 77) {
          value = {pm1: rdata[10]*256+rdata[11],  pm2_5: rdata[12]*256+rdata[13], pm10: rdata[14]*256+rdata[15]}
          for (let i = 0; i <= 29; i++) {
            checksum += rdata[i]
          }
          if (rdata[30]*256+rdata[31] == checksum) {
            callback (null, value, null);
          }
          else {
            callback (`ZHZ06 Bad Checksum`,value, `Checksam value: ${rdata[30]*256+rdata[31]} / Calculated value: ${checksum}`);
          }
        }
        else {
          callback (`ZHZ06 Data Format Error`, null, `The format of the received data is incorrect.`);
        }
      });
    });
  }
}

if (require.main === module) {
  new ZHZ06 (process.argv[2], function(error, value, stderr){
    console.log (value);
    console.log (error);
    console.log (stderr);
  });
}
else {
  module.exports = ZHZ06;
}
