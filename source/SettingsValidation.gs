function idVer(values, idCol){
  try{
    if(idCol != -1){
      var id = values[1][idCol];
      
      if(RegExp('[^a-zA-Z]', '').test(id.charAt(0))){ //Does not start with a letter
        addToErrorLog("The form ID '" + id + "' does not start with a letter, but a '" + id.charAt(0) +
          "'. Please make sure it starts with a letter.");
      }
      else if(RegExp('[^a-zA-Z0-9\-_.]', '').test(id)){ //Invaid characters
        var invalid = cellValue.match(/[^a-zA-Z0-9\-_.]/g).join('');
        addToErrorLog("The form ID '" + id + "' contains invalid characters. " +
                      "Please only use the 26 letters of the English alphabet, numbers, hyphens, and underscores.<br>Invalid characters between the pipes:<br>|" +
                      invalid + "|");
      }
      else if(RegExp('[A-Z.]', '').test(id)){ //Uses uppercase letters or dots
        addToWarningLog("The form ID contains uppercase letters and/or dots (.). " + 
                        "The form will still work well, but it is recommended that field names only contain letters, underscores, and hyphens.");
      }
    }
  }
  catch(e){
    breakerError("Error checking the form ID on the <i>settings</i> sheet.", e);
  }
}


function versionVer(values, formulas, versionCol){
  try{
    //Expected version formula:
    //=TEXT(YEAR(NOW())-2000, "00") & TEXT(MONTH(NOW()), "00") & TEXT(DAY(NOW()), "00") & TEXT(HOUR(NOW()), "00") & TEXT(MINUTE(NOW()), "00")
    
    if(versionCol != -1){
      var versionFormula = formulas[1][versionCol];
      var expectRegex = /^(=TEXT\(YEAR\(NOW\(\)\)-2000( *\+ *[0-9]+)*, *\"00\"\) *& *TEXT\(MONTH\(NOW\(\)\)( *\+ *[0-9]+)*, *\"00\"\) *& *TEXT\(DAY\(NOW\(\)\)( *\+ *[0-9]+)*, *\"00\"\) *& *TEXT\(HOUR\(NOW\(\)\)( *\+ *[0-9]+)*, *\"00\"\) *& *TEXT\(MINUTE\(NOW\(\)\)( *\+ *[0-9]+)*, *\"00\"\)( *\+ *[0-9]+)*)$/;
      //Above formula takes into account if +[number] was added to one of the parts.
      
      if(!expectRegex.test(versionFormula)){
        addToWarningLog("The 'version' does not use the recommended formula. It is recommended that you us the following version formula:<br>" +
                        '=TEXT(YEAR(NOW())-2000, "00") & TEXT(MONTH(NOW()), "00") & TEXT(DAY(NOW()), "00") & TEXT(HOUR(NOW()), "00") & TEXT(MINUTE(NOW()), "00")');
      }
    }
  }
  catch(e){
    breakerError("Error checking the version number on the <i>settings</i> sheet.", e);
  }
} //END versionVer


function keyVer(values, keyCol){
  try{
    if(keyCol != -1){
      var key = values[1][keyCol];
      
      if(key.startsWith("-----BEGIN PUBLIC KEY-----")){
        addToErrorLog("The public key on the 'settings' sheet begins with '-----BEGIN PUBLIC KEY-----'. Only use the key itself, " +
                      "not the opening and closing tags.<br>" +
                      "In the future, have the SurveyCTO server console enter the encryption key for you.");
      }
    }
  }
  catch(e){
    breakerError("Error checking the public key on the <i>settings</i> sheet.", e);
  }
} //END keyVer


function instanceVer(values, fields, instanceCol){
  try{
    if(instanceCol != -1){
      var instanceName = values[1][instanceCol];
      exprChecks(instanceName, 'instance_name', fields, instanceCol, "2 of the 'instance' column of the settings sheet")
      //IMPORTANT: Checks each part of the expression and ensures it is all correct
    }
  }
  catch(e){
    breakerError("Error checking the instance name on the <i>settings</i> sheet.", e);
  }
} //END instanceVer
