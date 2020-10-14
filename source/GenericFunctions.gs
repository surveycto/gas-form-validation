function testing(){ //Testing only!
  //Logger.log(Array.isArray([1, 2]));
  
  Logger.log(countArray());
}

String.prototype.startsWith = function(str) {
  return (this.indexOf(str) === 0);
}

String.prototype.endsWith = function(str) {
  return (this.indexOf(str) === (this.length - 1));
}

function arraysEqual(array1, array2) {
  if(array1 == array2){ //Both are aleady equal (usually if they are null)
    return true;
  }
  
  if(!Array.isArray(array1) || !Array.isArray(array2)){ //One is not an array
    throw "One of the arguments is not an array.";
  }
  
  if(array1.length != array2.length){ //They are not the same length, so they are not equal
    return false;
  }
    
  for(var a = 0; a < array1.length; a++){
    if(array1[a].length != null || array2[a].length != null){
      //The above is true if this part of the array has an array in it. We then do a recursive function to check 
      if(!arraysEqual(array1[a], array2[a])){
        return false;
      }
    } //End arrays contains arrays
    else{
      if(array1[a] != array2[a]){
        return false;
      }
    } //End ELSE
  } //End FOR loop
  
  return true
} //End arraysEqual


function xor(boolOne, boolTwo){
  if(boolOne == boolTwo){
    return false;
  }
  else{
    return true;
  }
} //End xor

function countArray(array){ //Checks a var, returns 0 if null or blank, 1 if not an array or array with one element, and the array length otherwise
  //May expand at some point for multi-dim arrays, but that's not needed now.
  if(array == null || array == ''){
    return 0;
  }
  else if (!Array.isArray(array)){
    return 1;
  }
  else{
    return array.length;
  }
}

//Given an array, creates a list for display with the proper usage of commas and "and", including the Oxford comma.
function listDisplay(array, startChar, endChar){
  if(startChar == null){
    startChar = "";
  }
  else{
    startChar = String(startChar);
  }
  
  if(endChar == null){
    endChar = "";
  }
  else{
    endChar = String(endChar);
  }
  
  var numItems = array.length;
  var pathListDisp;
  if(numItems == 0){
    return null;
  }
  else if(numItems == 1){
    pathListDisp = startChar + array[0] + endChar;
  }
  else if(numItems == 2){
    pathListDisp = startChar + array[0] + endChar + " and " + startChar + array[1] + endChar;
  }
  else{
    numItems--;
    pathListDisp = "";
    for(var a = 0; a < numItems; a++){
      pathListDisp += startChar + array[a] + endChar + ", ";
    }
    pathListDisp += "and " + startChar + array[numItems] + endChar;
  }
  return pathListDisp;
  
}
