function getDefLang(values){
  try{
    var defLangCol = values[0].indexOf('default_language');
    
    if(defLangCol == -1){ //No list column
      //No need to add to error log that there is no default language, since this is addressed in another function.
      return '';
    }
    else{
      var defLang = values[1][defLangCol];
      if((defLang == '') || (defLang == null)){
        addToErrorLog("On the 'settings' sheet, there is no set 'default_language'. Be sure to add a default language.");
        return '';
      }
      else{
        return defLang;
      } //End default language found
    } //End column found
  }
  catch(e){
    breakerError("Error getting the default language.", e);
    return '';
  }
} //END getDefLang()




function getFieldType(value){ //Takes the complex field type (like "select_one listname") and gets the simple type (like "select_one")
  try{
    var fieldTypeLong = value.match(/[^ ]+/g);
    if(fieldTypeLong == null){
      var fieldType = null, additionalProp = null;
    }
    else{
      var fieldType = fieldTypeLong[0]; //Gets the actual type, without any list names or anything.
      var additionalProp = fieldTypeLong[1];
    }
    
    return [fieldType,additionalProp];
  }
  catch(e){
    breakerError("Error getting the field type.", e);
    return value;
  }
}

function quoteReplacer(match){
  try{
    if(/'[$]{[a-zA-Z0-9._-]+}'/.test(match)){
      return match;
    }
    else{
      return "'QUOTE'";
    }
  }
  catch(e){
    breakerError("Error checking for quotes.", e);
    return match;
  }
}


//Checks for invalid characters
function checkInvalid(values, sheet){
  //Logger.log("Starting character checker");
  var start = Date.now();
  try{
    var rows = values.length;
    var cols = values[0].length;
    
    for(var r = 0; r < rows; r++){
      for(var c = 0; c < cols; c++){
        var cellValue = String(values[r][c]);
        var re = /[\u0000-\u0009\u000B\u000E-\u001F\u007F-\u009F]/g;
        var hasInvalids = cellValue.search(re);
        if(hasInvalids != -1){
          var errorMessage = "In column " + String.fromCharCode(c + 65) + ", row " + (r + 1) + " of the <i>" + sheet + "</i> sheet, there ";
          /*if(numInvalids == 1){
          errorMessage += "is an invalid character";
          }
          else{*/
          errorMessage += "are invalid characters";
          /*}*/
          errorMessage += " that could interfere with data collection. " +
            "Please remove any invalid characters. You may have to re-type the cell.<br>\n" +
              "Invalid character decimal number: " + cellValue.charAt(hasInvalids).charCodeAt();
            
            /*while((match = re.exec(cellValue)) != null){
              var position = match.index;
              var invalidChar = match;
              var charCode = match.charCodeAt();
              errorMessage =+ "<li type='a'>At position " + position + ", found character decimal number " + charCode + ".</li>\n";
            } //End WHILE loop
          errorMessage += "</ul>";*/
          addToErrorLog(errorMessage);
          
        } //End IF invalids found      
      } // End columns check
    } //End rows check
  }
  catch(e){
    breakerError("Error while checking for invalid characters.", e);
  }
  
  /*var end = Date.now();
  var totalTime = end - start;
  //Logger.log("Invalid time: " + (totalTime) + " seconds.");//*/
} //END checkInvalid
