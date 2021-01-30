var cors = require('cors')
var express = require('express')
var app = express();
const fs = require('fs');

var output_csv_to_client = require('./src/sig-dif-functions').output_csv_to_client;


var port = process.env.PORT || 8000

//app.use(cors());

app.use(express.static(__dirname));

app.get("/", function(req,res){
    res.sendFile('./public/index.html', { root: __dirname });
})

app.use(cors());

//get results
// app.use("/results", function(req,res){  
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'content-type');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');


//   var string = JSON.stringify(curr_letters);
//   for(var i=0;i<matrix.length;i++){
//       string += "\n" + JSON.stringify(matrix[i]);
//   }
//   //console.log("results string", string)
//   res.send(string);
// })

//get input file
app.use("/input_file", function(req,res){  
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'content-type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  
  
  //Load in the input, replace spaces and quotes, and split so that we can parse the array.
  var lines = req.query.input;
  console.log('lines', lines)
  lines = lines.split("SPLITHERE");  
  //console.log("input file", output_csv_to_client(lines))
  res.send(output_csv_to_client(lines));
})

//takes the information for the output file and writes it
app.use("/write_output_file", function(req,res){  
  fs.writeFileSync("output_files/"+req.query.input.split("SPLITHERE")[0],req.query.input.split("SPLITHERE")[1], function (err) {
    if (err) throw err;
    console.log('Saved!');
  });  
  res.send();
})

app.listen(port, function(){
  console.log("app running on local host 8000")
})