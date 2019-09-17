'use strict';

const fs = require('fs');

/***
 * Function that takes a path and loads in the correct csv file.
 * Returns the data split into lines
 */
let load_data = function(path){
  let data = fs.readFileSync(path); //load in the data
  var lines = data.toString().split("\r\n"); //split by line
  return (lines);
  
}

/***
 * Function that finds the bases (the row in lines) given the lines array
 */
let find_bases = function(lines){
  var bases = lines[0].split(',');
  Object.keys(bases).map(function(index){  
    bases[index] = bases[index].replace("n=","");  
  })
  bases.shift(); //remove the first element
  return (bases);
}

/***
 * Function that finds the nums (the proportions) given the lines array
 */
let find_nums = function(lines){
  var nums = [];
  //loop through lines and load into nums
  for(var i=1;i<lines.length;i++){
    var current_line = lines[i].split(",");
    current_line.shift();//remove the first element which is a label
    nums[i-1] = current_line;
  }

  //loop through to replace all numbers and make sure percentages are decimals
  Object.keys(nums).map(function(index){
    var new_line = [];  
    //If there is a percentage in the string of the JSON, then change from percentages to decimals    
    Object.keys(nums[index]).map(function(i){
      nums[index][i] = nums[index][i].replace(/[A-Z]/g,"");
      nums[index][i] = nums[index][i].replace(/ /g,"");
  
      if(JSON.stringify(nums[index][i]).includes("%")){  
        var s = nums[index][i];
        s = s.replace(/%/g,"");
        if(s.length==1)
          s = ".0"+s;
        else{
          if(s.includes("<")){
            s = "005";
          }
          s = "."+s;
        }
        new_line.push(s);
      }
    });  
    if(new_line.length > 0)
      nums[index] = new_line;
  })
  return (nums);
}

/**
 * Function that takes in a csv and returns the appropriate dataframe columns.
 * EX. if there are 3 columns, it returns AB AC BC as an array. 
 */
let letter_combos = function(bases){
    const columns = [];
    var cols = bases.length;  
    
    
    for(var j =0; j< cols-1; j++){
        for(var k = j+1;k<cols;k++){
          columns.push(letters[j] + " " + letters[k]);          
        }
      }
    
    return columns;
}

//var columns = letter_combos(bases);
let find_curr_letters = function(bases,letters){
  var curr_letters = []
  for(var i =0;i<bases.length;i++)
    curr_letters.push(letters[i]); 
  return curr_letters;
}

let z_score = function(nums, bases){
  var list_of_output = [];
    for(var i = 0; i<nums.length;i++){
        var output =[];
        for(var j=0;j<bases.length-1;j++){          
          for(var k=j+1;k<bases.length;k++){
            //Formula for Z-score:  (p1-p2)/SE(p1-p2)
            //SE(p1-p2):  SQRT[(p1(1-p1)/n1-1)+(p2(1-p2)/n2-1)]

            //n is the first line in the entire table
            var n1 = parseFloat(bases[j]);
            var n2 = parseFloat(bases[k]);

            //p is the current line in the current row
            var p1 = parseFloat(nums[i][j]);
            var p2 = parseFloat(nums[i][k]);

            //calculate z score and add to current output line for current row of proportions
            var p = (p1 * n1 + p2 * n2) / (n1 + n2);
            //var z = (p1 - p2) / (Math.sqrt((p*(1-p))*((1/n1)+(1/n2))));            
            var z = (p1 - p2) / Math.sqrt((p1 * (1 - p1) / (n1 - 1))+(p2 * (1 - p2) / (n2 - 1)));
            output.push(z);
          }
        }
        //add the row of output to the current output
        list_of_output.push(output);
      }
      return (list_of_output);
}

//var list_of_output = z_score(nums,bases);

let final_output = function(nums,bases,list_of_output){
  //Create an empty matrix
  const matrix = new Array(nums.length).fill("").map(() => new Array(bases.length).fill(""));
  for(var i=0;i<nums.length;i++){
    for(var j=0;j<bases.length;j++){
      //curr is the current z score
      var curr = Number(list_of_output[i][j]);

      //if the z score is above 1.96, then there is a significant difference and we update our table
      if(Math.abs(curr)>1.96){
        //x is the first letter being tested, y is the second letter being tested (ex. "A C" means x is A and y is C)      
        var x = columns[j].split(" ")[0];
        var x_index = letters.indexOf(x);      
        var y = columns[j].split(" ")[1];
        var y_index = letters.indexOf(y);
        //if positive, then update x to be significantly different than y
        if(curr > 0){
          matrix[i][x_index] += ""+y;
        //if negative, then update y to be significantly different than x
        }else{
          matrix[i][y_index] += ""+x;
        }
      }
    }
  }
  return (matrix);
}

//var matrix = final_output(nums,bases,list_of_output);

var lines = load_data("test.csv");
var bases = find_bases(lines);
var nums = find_nums(lines);
var letters = ["A","B","C","D","E","F"];
var columns = letter_combos(bases);
var curr_letters = find_curr_letters(bases, letters);
var list_of_output = z_score(nums,bases);
var matrix = final_output(nums,bases,list_of_output);
