//LIST_NAME validation
function listNameVer(choicesValues, headerOrder){
  try{
    var numRows = choicesValues.length;
    var listCol = headerOrder[0];
  }
  catch(e){
    breakerError("Unable to get values on the 'choices' sheet.", e);
    return;
  }
  var allLists = [];
  
  var lastList;
  
  for(var r = 1; r < numRows; r++){
    try{
      var row = r + 1;
      var listName = choicesValues[r][listCol];
      
      if((listName == '') || (listName == null)){
        var wholeRow = choicesValues[r].join('');
        if((wholeRow != '') && (wholeRow != null)){ //Checks if there is something in the row, despite having no list name
          for(var a = 0; a < choicesValues[r].length; a++){
            var cellValue = choicesValues[r][a];
            
            if((cellValue != '') && (cellValue != null)){
              var errorColumn = String.fromCharCode(a + 65);
              addToWarningLog("On row " + row + " of the 'choices' sheet, there is content in column " + errorColumn + 
                            ", but no list name. You may want to remove this content.<br>" +
                            "Content (between lines): |" + cellValue + "|");
            } //End found non-blank cell
          } //End FOR loop looking for the content
        } //End other content in the row despite blank list_name
      } //End list_name blank
      else if(allLists.indexOf(listName) == -1){//If list name not blank //Begin list name character checks
        
        if(RegExp('[^a-zA-Z]', 'g').test(listName.charAt(0))){
          addToErrorLog("On row " + row + " of the 'choices' sheet, the list_name '" + listName + "' does not start with a letter. " +
                        "Make sure it starts with a letter.");
        }
        else if(RegExp('[^a-zA-Z0-9\-_.]', 'g').test(listName)){ //Invaid characters
          //NEED TO ADD SOMETHING ABOUT LEADING OR ENDING SPACES
          addToErrorLog("On row " + row + " of the 'choices' sheet, the list_name '" + listName + "' has invalid characters. " +
                        "Please only use the 26 letters of the English alphabet, numbers, hyphens, and underscores.");
        }
        else if(RegExp('[A-Z.]', 'g').test(listName)){ //Uses uppercase letters or dots
          addToWarningLog("On row " + row + " of the 'choices' sheet, the list_name '" + listName +
                          "' contains uppercase letters and/or dots (.). The form will still work well, " +
                          "but it is recommended that list_names only contain letters, underscores, and hyphens.");
        } //End list name character checks
        
        allLists.push(listName);
      } //End list_name not blank and character checks
      else if(listName != lastList){ //Adding choices to a list that had been ended
        addToWarningLog("On row " + row + " of the 'choices' sheet, you start the list with the list_name " +
                        listName + ", but that list was started elsewhere. The form will still work well, but it is recommended that list " +
                        "choices are kept together.");
      }
      lastList = listName;
    } //End TRY
    catch(e){
      breakerError("Error getting list information on row " + (r + 1) + " of the <i>choices</i> sheet.", e);
    }
  } //End FOR
} //END listNameVer


//VALUE validation
function valueVer(choicesValues, headerOrder, fields){
  try{
    var columnNum = headerOrder[1];
    var numRows = choicesValues.length;
    var listCol = headerOrder[0];
  }
  catch(e){
    breakerError("Unable to get values and header info for 'value' column on the <i>choices</i> sheet.", e);
  }
  
  var listValues = {};
  
  for(var r = 1; r < numRows; r++){
    var row = r + 1;
    
    try{
      var cellValue = choicesValues[r][listCol];
      if((cellValue == null) || (cellValue == '')){
        continue;
      }
      var listName = cellValue.match(/[^ ]+.*[^ ]+|[^ ]/);
      if(listName == null){
        addToWarningLog("On row " + (r + 1) + " of the <i>choices</i> sheet, the value is just one or more spaces. " +
          "This may cause issues. It is recommended you remove leading and ending spaces. " +
            "Click <a onclick='leSpaceRemover()'>here</a> to do so automatically.");
        continue;
      }
      
      listName = listName[0];
      
      if(!(listName == null || listName == '')){ //If no list name assigned, there is no need to go through the checks. Addressed in list_name checks
        var value = choicesValues[r][columnNum];
        
        //This is for checking if the value has already been used in the choice list.
        if(listValues[listName] == null){ //Starting new choice list
          listValues[listName] = [String(value)]; //Made a string, in case numeric values are interpreted as numbers at one point, and str at another
        }
        else{
          var curList = listValues[listName]
          var listValueIndex = curList.indexOf(String(value));
          if(listValueIndex != -1){
            addToErrorLog("On row " + row + " of the 'choices' sheet, you re-use a value for the list '" + listName +
                          "'. Change the value of this choice to distinguish it.");
          }
          
          listValues[listName].push(String(value));
        }
        
        var fieldCall = String(value).match(/\${.+}/g);
        if(fieldCall != null){ //Field call used
          if(fieldCall != value){
            addToErrorLog("On row " + row + " of the 'choices' sheet, you reference the field " + fieldCall +
                          " for the 'value', but there is other content in that value as well. When using a field for a value," +
                          " use that field reference by itself. " +
                          "For a longer value, you can use a field that uses the concat() function.");
          } //End content in value along with field call
          
          var fieldName = fieldCall[0].match();
          
          var fieldInfo = fieldIndexes[fieldName];
          if(fieldInfo == null){ //Field name not found
            addToErrorLog("On row " + row + " of the 'choices' sheet, you use the field '" + fieldName + "', but there is no field with " +
                          "that name.");
          } //End existence check
          else if(fieldInfo.path.length != 1){ //Used repeated field, indexed-repeat error
            addToErrorLog("On row " + row + " of the 'choices' sheet, you use the field '" + fieldName + "', but that is a repeated field. " +
                          "Instead, call for a field that uses the indexed-repeat() function, like this:<br>" +
                          getIndRepExpr(fieldName, fieldInfo.path));
          } //End indexed-repeat check
        } //End field call used
        else if((value == null || value == '') && (typeof value != 'number')){ //No value
          addToErrorLog("On row " + row + " of the 'choices' sheet, there is a list name, but no value. Be sure to add a value.");
        } //End value blank
      }
    } //End TRY
    catch(e){
      breakerError("Error getting value information on row " + (r + 1) + " of the <i>choices</i> sheet.", e);
    } //End CATCH
  } //End FOR loop
} //END valueVer



//LABEL validation
function choicesLabVer(values, headerOrder, fields, defLang){
  try{
    var listNameColNum = headerOrder[0];
    var listLabelColNum = headerOrder[2];
    var numRows = values.length;
    var numCols = values[0].length
    }
  catch(e){
    breakerError("Unable to get values and header info for 'label' column on the <i>choices</i> sheet.", e);
    return;
  }
  
  
  var labCols = ['label']; //First check the regular 'label' column
  var langs = [defLang];
  for(var c = 0; c < numCols; c++){
    var header = values[0][c];
    
    if(header.startsWith('label')){
      var listLabels = {}; //This will store all list labels to check for doubles in the same list
      if((header.length > 5) && (header.charAt(5) != ':')){
        addToErrorLog("On the <i>choice</i> sheet, for the column  " + String.fromCharCode(c + 65) + " header '" + header +
          "', it looks like you are trying to start a label translation, but there is no colon. " +
            "Make sure there is a single colon separating 'label' and the language name.");
        continue;
      }
      
      labCols.push(header);
      var thisLang = header.substring(6);
      langs.push(thisLang);
      
      if((defLang != null) && (thisLang.toLowerCase() == defLang.toLowerCase())){ //Default lang named in a header
        addToErrorLog("On the <i>choice</i> sheet, for the column  " + String.fromCharCode(c + 65) + " header '" + header +"', " +
          "change it to just 'label', since '" + defLang + "' is the default language. There may otherwise be issues with the form.");
      }
      
      if(thisLang.startsWith(':')){ //Extra :
        addToWarningLog("On the <i>choice</i> sheet, for the column  " + String.fromCharCode(c + 65) + " header '" + header +
          "', you just need one colon ':'. " + "Consider removing any extra colons.");
      }
      
      for(var r = 1; r < numRows; r++){
        try{
          var row = r + 1;
          var label = values[r][c];
          if(label != '' && label != null){
            var listName = values[r][listNameColNum];
            
            //This is for checking if the label has already been used in the choice list.
            if(listLabels[listName] == null){
              listLabels[listName] = [String(label)];
            }
            else{
              var curList = listLabels[listName]
              var listLabelIndex = curList.indexOf(String(label));
              if(listLabelIndex != -1){
                addToWarningLog("On row " + row + " of the 'choices' sheet, in the '" + header + "' column, you re-use a label for the list '" +
                                listName + "'. It will still work, but it is recommended that you give it a different label.");
              }
              
              listLabels[listName].push(String(label));
            }
            
            checkFieldsExist(label, 'choice', fields, null, row + " of the 'choices' sheet");
            //Checks if referenced fields are actual fields in the form
            
            //If the label is blank, is a visibile field, and is not an audit
            if((label == '' || label == null) && !(listName == '' || listName == null)){
              addToErrorLog("On row " + row + " of the 'choices' sheet, it is part of the " + listName +
                            " list, but there is no label. Please make sure this row has a label, or remove the list name.");
            }
            
            listLabels[listName].push(label); //Adds to the list so can check later if the label is already in use for that choice list
          } //End value not blank
        } //End TRY
        catch(e){
          breakerError("Error getting label information on row " + (r + 1) + " of the <i>choices</i> sheet.", e);
        }
      } //End FOR loop
    } //End found label col
  } //End multi-lang header check
} //END choicesLabVer


//FILTER validation
function filterVer(choicesValues, columnNum, headerOrder){
  var numRows = choicesValues.length;
}
