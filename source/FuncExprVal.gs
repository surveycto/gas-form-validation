//Validates an indexed-repeat() expression that was used
function valIndRep(indRepExpr, fields, row){
  try{
    if(indRepExpr.startsWith('indexed-repeat(')){
      var indRepExprInner = indRepExpr.substring(15, indRepExpr.length - 1); //Inner part of the expression, so no 'indexed-repeat(' or ')'
    }
    else if(indRepExpr.charAt(0) == '(' && indRepExpr.charAt(indRepExpr.length - 1) == ')'){
      var indRepExprInner = indRepExpr.substring(1, indRepExpr.length - 1);
    }
    else{
      var indRepExprInner = indRepExpr;
    }
  }
  catch(e){
    breakerError("Error getting expression information for the indexed-repeat() function on row " + row, e);
    return;
  }
  
  try{
    var iRParts = indRepExprInner.match(/[^,]+/g); //First in array will be the actual field, then the group-name-index pairs
    
    if(iRParts == null){ // Kind of a repeat of an error, since other parts check for this
      addToErrorLog("On row " + row + ", you use an indexed-repeat() expression, but there is only one parameter. " +
                    "Make sure there are at least 3 parameters.");
      return;
    }
    
    var fieldCall = iRParts[0];
    var fieldCall = fieldCall.match(/\${.+}/g); //Stores each field and group name used in an array
    
    if(fieldCall == null){ //No field call for first parameter
      addToErrorLog("On row " + row + ", you use an indexed-repeat() expression, but there is no field in the first parameter. " +
                    "Make sure there is a field for the first parameter.");
      return;
    }
    
    var indRepField = fieldCall[0];
    indRepField = indRepField.substring(2, indRepField.length - 1); //Field name referenced in the expression (substring removed the ${})
    var fieldPath = fields[indRepField].path.slice(); //Repeat groups the referenced field is in. Using the slice() function since this will be
    // cut down as the group is found in the expression, and don't want to accidentally cut down the actual stored path.
    
    if(fieldPath == []){ //Referenced field does not exist
      addToErrorLog("On row " + row + ", you use an indexed-repeat() expression for the field '" + iRParts[0] +
                    "', but that is not a repeated field. Please remove the indexed-repeat() expression around the field.");
    }
    else if(fieldPath == null){
      addToAppLog("On row " + row + ", there was an issue when retrieving the field path.");
    }
    else{
      var indRepExprAns = getIndRepExpr(indRepField, fieldPath); //Example of what it SHOULD look like
      
      //fieldPath is the stored path.
      var exprGroups = [];
      var exprInds = [];
      
      try{
        for(var f = 1; f < iRParts.length; f++){ //Checks each group and index used, and confirms they are valid
          var arg = iRParts[f];
          
          arg = arg.match(/[^ ]+.*[^ ]+|[^ ]+/); //Gets rid of leading and ending spaces
          
          if(arg == null){
            addToErrorLog("On row " + row + ", you use an indexed-repeat(), but parameter " + (f + 1) + " is empty. " + 
              "Make sure each parameter contains data.<br>" +
                "Example:<br>" + indRepExprAns);
            continue; //No need to check the rest if blank
          }
          else if(arg.length > 1){ //There should never be more than one result in the above regular expression.
            addToAppLog("Report to developer: On row " + row + ", there is something odd about your indexed-repeat() expression. " +
                        "Please report this error, sending your spreadsheet form definition.<br>|" + arg + "|<br>Error code: IR-V");
          }
          else{
            arg = arg[0];
          }
          
          //Half the time checks groups, the other half indexes
          if(f % 2 == 1){ //Checks the group references
            if(!/\${.+}/.test(arg)){ //No field or group call
              addToErrorLog("On row " + row + ", you use an indexed-repeat() expression, but for argument " + (f + 1) +
                ", there is no call to a group. Make sure that parameter is a call to a group.<br>" +
                  "Example:<br>" + indRepExprAns);
              continue; //Since there is no group call, can skip all of the other checks
            }
            else if(!/^\${.+}$/.test(arg)){ //There is a field or group call, but other stuff as well
              addToErrorLog("On row " + row + ", you use an indexed-repeat(), but parameter " + (f + 1) + " contains other data. " + 
                "Make sure the group call is by itself.<br>" +
                  "Example:<br>" + indRepExprAns);
              continue;
            }
            
            
            var groupName = arg.match(/\${.+}/g)[0]; //Picks out the group call, if any
            groupName = groupName.substring(2, groupName.length - 1); //group name without the ${}
            
            var groupIndex = fieldPath.indexOf(groupName); //Index of the group used by the user in the expression
            if(groupIndex == -1){
              addToErrorLog("On row " + row + ", you use an indexed-repeat() expression, but for argument " + (f + 1) +
                ", the repeat group \"" + groupName + "\" is not needed. It should be removed.");
            }
            else if(groupIndex == 0){
              fieldPath = fieldPath.slice(1);
            }
            else{
              Logger.log("Removing " + groupName + ".\nOld list: " + fieldPath);
              fieldPath = fieldPath.slice(0,groupIndex).concat(fieldPath.slice(groupIndex + 1));
              Logger.log("New list: " + fieldPath);
            }
          } //End check group ref
          else{ //Not a group argument, so checks the index formula
            otherExprCheck(arg, row)
          } //End INDEX check
        } //End FOR loop check ind-rep groups and indexes
        
        //At the end, all needed repeat groups in the path should have been used. If not, there is an error.
        if(fieldPath.length != 0){
          var groupDisp = listDisplay(fieldPath, "&#34;", "&#34;");
          
          
          addToErrorLog("On row " + row + ", you use an indexed-repeat(), but you are missing the group(s) " +
                        groupDisp + ". Add those with indexes so the function can work.");
        }
        
      } //End TRY
      catch(e){
        breakerError("Error checking argument " + (f + 1) + " of the indexed-repeat() expression on row " + row, e);
      }
    } //End field found and has path
  }
  catch(e){
    breakerError("Error checking the indexed-repeat() expression on row " + row + ".", e);
  }
} //END valIndRep




//This is used in valIndRep to compare the paths of the expression, and the path of the referenced field, to check if indexed-repeat() is needed.
//Returns TRUE if indexed-repeat is needed, and FALSE if it NOT needed. Essentially, returns TRUE if they do NOT match up
/*
If each part of the referenced path equals the current path until the end of current path, then it is all set, since
if the current path is in a deeper nested repeat than the referenced path, that is fine.
This is based on another function I made, arraysEqual
*/
function needIndRep(curPath, refPath){
  try{
    if(curPath == refPath){ //Both are aleady equal (usually if they are null)
      return false;
    }
    
    if(!Array.isArray(curPath) || !Array.isArray(refPath)){ //One is not an array. This should never happen in this context
      return true;
    }
    
    for(var a = 0; a < refPath.length; a++){
      if(curPath[a] != refPath[a]){
        return true;
      }
    } //End FOR loop
  }
  catch(e){
    breakerError("Error checking if an indexed-repeat() expression is needed.",e);
  }
  
  return false;
} //END needIndRep



//Function to get what the indexed-repeat expression SHOULD be
function getIndRepExpr(fieldRefName, refPath){
  try{
    var indRepExpr = "indexed-repeat(${" + fieldRefName + "}"; //Slowly builds into an example expression that the user can use.
    var refPathLength = refPath.length;
    for(var i = 0; i < refPathLength; i++){ //Start at 1, since the first part of the array is blank
      indRepExpr += ", ${" + refPath[i] + "}, ${index_field" + (i + 1) + "}";
    }
    indRepExpr += ")";
    
    return indRepExpr;
  }
  catch(e){
    breakerError("Error getting a sample indexed-repeat() expression", e);
    return "indexed-repeat(${fieldname}, ${groupname}, ${index})";
  }
} //END getIndRepExpr
