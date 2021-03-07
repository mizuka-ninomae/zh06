const ZH06  = require('zh06');
let   uart_path = "/dev/ttyAMA3";

let zh06 = new ZH06(uart_path, function(error, value, stderr){
  console.log (value);
  console.log (error);
  console.log (stderr);
});
