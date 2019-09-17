var R = require("r-script");

var out = R("../sig_dif.R")
  .data("test.csv",1)
  .callSync();
  
console.log(out);