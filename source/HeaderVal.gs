function getHeaders(values){
  try{
  //var numHeaders = surveyValues.length;
  var headers = values[0] //Stores the headers in an array.
  return headers;
  }
  catch(e){
    throw "Error getting header information.\n" + e;
  }
}


function headerOrder(headers, requiredHeaders, recomHeaders, otherHeaders, sheetName){
  //This gets the order of the headers, in case some columns were moved or deleted.
  var headerPos = [];
  
  try{
    
    var numHeaders = requiredHeaders.length;
    
    testingSidebar("About to check required headers");
    headerPos = headerPos.concat(headerLoop(requiredHeaders, headers, 'required', sheetName));
    headerPos = headerPos.concat(headerLoop(recomHeaders, headers, 'recommended', sheetName));
    headerPos = headerPos.concat(headerLoop(otherHeaders, headers, 'other', sheetName));
  
  testingSidebar("Completed checking headers");
  }
  catch(e){
    breakerError("Error while getting header information.", e);
  }
  return headerPos;
} //End header validation


//Iterates through each set of headers to see what is missing.
function headerLoop(sctoHeaders, usedHeaders, type, sheetName){
  var headerArray = [];
  try{
    var numHeaders = sctoHeaders.length;
    for(var h = 0; h < numHeaders; h++){
      try{
      if(Array.isArray(sctoHeaders[h])){
        var numHeaderOptions = sctoHeaders[h].length;
        for(var a = 0; a < numHeaderOptions; a++){
          var headerIndex = usedHeaders.indexOf(sctoHeaders[h][a])
          
          if(headerIndex != -1){
            break;}
        } //End FOR loop through each acceptable header name
        //If reaches the end of the loop, and an acceptable header is not found, the headerIndex will remain -1
      }
      else{
        headerIndex = usedHeaders.indexOf(sctoHeaders[h]); //Returns -1 if the header does not exist.
      } //End only one acceptable header name
      
      headerArray.push(headerIndex);
        
        if(headerIndex == -1){
          if(Array.isArray(sctoHeaders[h])){
            var headerErrorName = sctoHeaders[h][0];
          }
          else{
            var headerErrorName = sctoHeaders[h];
          }
          
          if(type == "required"){
            addToErrorLog("Missing header '" + headerErrorName + "' on sheet <i>" + sheetName + "</i>.");
          }
          else if(type == "recommended"){
            addToWarningLog("Missing header '" + headerErrorName + "' on sheet <i>" + sheetName +
                 "</i>. The form will work without this row, but it may be needed in your form design. Consider adding it.");
          }
        } //End header not found
        
      } //End TRY
      catch(e){
        breakerError("Error while iterating through the " + type + " headers, header index " + h + ".", e);
      }
    } //End For loop through other headers
  } //End TRY
  catch(e){
    breakerError("Error while getting " + type + " header information on <i>" + sheetName + "</i> sheet.", e);
  }
  finally{
    return headerArray;
  }
} //END headerLoop
