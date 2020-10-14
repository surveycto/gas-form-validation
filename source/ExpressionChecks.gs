function exprPartVerDriver(){ //TESTING ONLY
  exprPartVer("pulldata(concat(concat(), ${num}), concat('header', ${num}), 'uuid', ${uuid})", ['num', 'uuid'], [[], []], 3);
  exprPartVer("5 + concat('hi ', 'there', index(3))", ['num', 'uuid'], [[], []], 4);
  exprPartVer("indexed-repeat(${name}, ${g1}, 1", ['num', 'uuid'], [[], []], 4);
  
  Logger.log("\n" + errors + "\n" + warnings + "\n" + appLog + "\n" + testLogs);
}


//This function is used to test each expression in a given property, such as a calculation or relevance.
//columnNum is not strictly necessary, but makes for better error messages
function exprVer(property, fields, columnNum){
  try{
    if(typeof property != 'string'){
      addToAppLog("Property '" + property + "' is not a string while checking column " + columnNum + ".");
    }
    //Note: Parameter "property" is not always used. When not used, it will be null.
    
    for(var fieldName in fields){ //Cycles through each expression for that column
      try{
        var field = fields[fieldName];
        var row = field.row; //Row number
        var expression = field[property]; //The expression, if any
        
        //Logger.log("Value: " + cellValue);
        
        //These fields get the field type.
        var fieldTypeLong = getFieldType(field.type);
        var fieldType = fieldTypeLong[0];
        var additionalProp = fieldTypeLong[1];
        
        //Individual property checks
        if(property == 'required'){
          var appearance = field.appearance;
          if((appearance == 'label') && !((expression == 'no') || (String(expression) == '0') || (expression == ''))){
            addToErrorLog("On row " + row + ", this field is sometimes/always required, but it has the 'label' appearance. " +
                          "This field should have its 'required' value set to <i>no</i>, or be blank.");
          }
        } //End individual property checks
        
        
        var justSpaces = /^[ ]+$/.test(expression);
        if((expression == null) || (expression == '') || (justSpaces)){
          if((fieldType == 'calculate' || fieldType == 'calculate_here') && property == 10){
            //This is true if the calculation (property 10) is blank, but it is a 'calculate' type field, which requires a calculation
            addToErrorLog("On row " + row + ", you are using a '" + fieldType + "' field, but there is no 'calculation'. Please add a calculation.");
          }
          
          if(justSpaces){
            addToWarningLog("On row " + row + ", the " + property + " property is just a space. It is recommended that this space is removed. " + 
                            "Click <a onclick='leSpaceRemover()'>here</a> to remove spaces like this, as well as leading and ending spaces.");
          }
        }
        else{
          //These are checks for individual field properties that have special conditions (required, repeat_count, etc)
          if(property == 11 && !(fieldType == 'begin' && (additionalProp == 'repeat' || additionalProp == 'group'))){ //repeat_count
            addToWarningLog("On row " + row + ", you have a repeat_count, but this is not a 'begin group' or 'begin repeat' " +
                            "field. The form will still work, but you may want to consider removing the repeat_count.<br>Repeat count: " + expression);
          }
          
          exprChecks(expression, field, fields, columnNum, row); //IMPORTANT
        } //End property has content
      }
      catch(e){
        breakerError("Error validating the '" + property + "' property of the field " + fieldName + "on row " + fields[fieldName].row + ".", e);
      }
    } //End FOR loop
  }
  catch(e){
    
  }
} //END exprVer


//This has been separated out so it can be used for 'instance_name' as well.
function exprChecks(expression, curField, fields, columnNum, row){
  try{
    //Logger.log("About to start checking for missing field.");
    var exprWoQuotes = String(expression).replace(/'[^']*'/g, quoteReplacer);
    //Removes parts in quotes, since they do not need to be checked
    //Keeps if just a single field call
    
    var allSingleQuotes = exprWoQuotes.match(/'/g);
    if((allSingleQuotes != null) && (allSingleQuotes.length % 2 == 1)){ //Extra single quotation mark
      addToErrorLog("On row " + row + ", column " + String.fromCharCode(columnNum + 65) +
        ", the expression has an extra quotation mark. Make there is an even number of quotation marks.");
    }
    
    if(/"/.test(exprWoQuotes)){ //Extra single quotation mark
      addToWarningLog("On row " + row + ", column " + String.fromCharCode(columnNum + 65) +
        ", the expression uses the double quote &quot;. It is recommended that you only use the single quote '.<br>" +
          "Click <a onclick=\"characterReplaceSpecial(34, 39)\">here</a> " +
            "to replace all double quotes with single quotes.");
    }
    
    //count Parentheses
    var leftParen = exprWoQuotes.match(/[(]/g);
    var rightParen = exprWoQuotes.match(/[)]/g);
    var numLeftParen = countArray(leftParen);
    var numRightParen = countArray(rightParen);
    
    if(numLeftParen != numRightParen){
      addToErrorLog("On row " + row + ", you have " + numLeftParen + " left Parentheses, and " + numRightParen +
                    " right Parentheses (outside of quotes). Make sure the Parentheses match up. Other errors on this row may be caused by this.");
    }
    
    //IMPORTANT: Checks each part of the expression and ensures it is all correct
    exprPartVer(exprWoQuotes, curField, fields, row);
  }
  catch(e){
    breakerError("Error while running expression checks for the expression \"" + expression + "\" in field \"" + curField + "\".");
  }
}


//This takes a full expression, picks out each function-expression part by itself (e.g. concat(1, 2) from coalesce(${field}, concat(1, 2)), and tests them.
function exprPartVer(fullExpr, curField, fields, row){ //Validates the expression, making sure it is in the proper format.
  try{
    fullExpr = fullExpr.replace(/\n/g, ' '); //Replaces new lines with spaces for the tests, since new lines can interfere with regex.
    
    var literals = ['or', 'and', 'null', 'true', 'false']; //Named literals that are NOT functions
    
    var lastFunctionRE = new RegExp('[a-z:-]+ *[(][^()]*[)](?!.*[(])', 'g'); //Regular expression to get the last function-expression
    var lastGroupRE = new RegExp('[(][^()]*[)](?!.*[(])', 'g'); //Regular expression to get the last group.
    var beforeGroupRE = new RegExp('[^, (]+(?= *[(][^()]*[)](?!.*[(]))', 'g'); /* Regular expression to get what is right before the last group
    to see if the group is for a function-expression. If it is not a function, then lastGroupRE will be used to get the expression part,
    and if it is NOT a function, then lastGroupRE will be used.
    */
    
    var regexUse; //Regex that will actually be used, depending on the circumstances. Will either be lastGroupRE or lastFunctionRE
    
    var exprSimp = fullExpr; //This starts as the full expression, but becomes simpler and simpler as each expression that makes it up is checked.
    //Logger.log("Start: " + exprSimp);
    while(/[(].*[)]/.test(exprSimp)){ //While there are still parts in Parentheses
      try{
        var beforeGroup = exprSimp.match(beforeGroupRE); //Gets what is right before the group. This will be checked to see if it is in function format
        if(beforeGroup == null){
          var beforeGroupPart = '';
        }
        else{
          var beforeGroupPart = String(beforeGroup[0]);
        } //End getting beforeGroupPart
        
        //These get the last part. The IF is if it is part of a function, the ELSE is if it is a normal group.
        var isFuncFormat = /^[a-z:-]+/.test(beforeGroupPart);
        var literalIndex = literals.indexOf(beforeGroupPart);
        if(isFuncFormat && (literalIndex == -1)){ //If in function format AND it is not one of the literals
          var lastPart = String(exprSimp).match(lastFunctionRE)[0]; //Will be cut out
          var lastGroup = String(exprSimp).match(lastGroupRE)[0]; //Will be tested
          var func = functionVer(lastPart, row);
          regexUse = lastFunctionRE
          
          //Validates specific function-expressions
          if(func == 'indexed-repeat'){
            valIndRep(lastGroup, fields, row);
            //lastPart = "'EXPRESSION'";
          } //End indexed-repeat() check
          else{
            checkFieldsExist(lastGroup, curField, fields, func, row);
            var args = otherExprCheck(lastGroup, fields, row);
            
            if(func == 'jr:choice-name'){
              verJCN(args, fields, row);
            }
          } //End individual function checks
        } //End last part is a function-expression
        else{ //Last part is a regular group, NOT part of a function-expression
          var lastPart = String(exprSimp).match(lastGroupRE)[0]; //Last group. Will be cut out
          var lastGroup = lastPart; //Will be tested
          var func = null;
          regexUse = lastGroupRE;
          checkFieldsExist(lastGroup, curField, fields, null, row); //
          otherExprCheck(lastPart, fields, row)
        } //End last part is a function-expression
        
        var split = String(exprSimp).split(regexUse); //Part before and after the last expression part
        if(split == null){
          exprSimp = ("'EXPRESSION'");
        }
        else if(split.length == 2){ //Removes the expression that was just checked
          exprSimp = (split[0] + "'EXPRESSION'" + split[1]);
        }
        else if(split.length == 1){
          if(exprSimp.startsWith(split[0])){
            exprSimp = (split[0] + "'EXPRESSION'");
          }
          else{
            exprSimp = ("'EXPRESSION'" + split[0]);
          }
        }
        else{ //There should not be more than two parts. There is something wrong if there are.
          addToAppLog("Report to developer: There is something odd about the expression '" + lastGroup + "' on row " + row +
                      " Please report this error, sending your spreadsheet form definition.<br> Error code: EC-EP");
        } //End simplifying expression
        //Logger.log(exprSimp);
      } //End TRY
      catch(e){
        breakerError("", e);
      }
    } //End WHILE loop through each expression part
    
    otherExprCheck(exprSimp, fields, row); //Checks to make sure everything else in the expression not in Parentheses is good
    checkFieldsExist(exprSimp, curField, fields, null, row); //Final check of any fields not within function-expressions
  }
  catch(e){
    breakerError("", e);
  }
} //END exprPartVer


//Checks the expression part to make sure it is in the proper format.
function functionVer(exprPart ,row){
  var functionDict = { // Dictionary contains all valid functions, along with the number of parameters they can take.
    'not': 0, 'string': 1, 'string-length': 1, 'substr': 3, 'concat': '3+', 'linebreak': 0, 'lower': 1, 'upper': 1, 'count-selected': 1, 'selected': 2,
    'selected-at': 2, 'choice-label': 2, 'jr:choice-name': 2, 'join': 2, 'join-if': 3, 'count': 1, 'count-if': 2, 'sum': 1, 'sum-if': 2,
    'min': '2+', 'min-if': 2, 'max': '2+', 'max-if': 2, 'index': 0, 'indexed-repeat': '3+', 'rank-index': 2, 'rank-index-if': 3, 'count-items': 2,
    'item-at': 3, 'item-index': 3, 'item-present': 3, 'de-duplicate': 2, 'rank-value': 2, 'distance-between': 2, 'area': 1, 'geo-scatter': 2,
    'short-geopoint': 1, 'number': 1, 'int': 1, 'format-number': 1, 'round': 2, 'abs': 1, 'pow': 2, 'log10': 1, 'sin': 1, 'cos': 1, 'tan': 1, 'asin': 1,
    'acos': 1, 'atan': 1, 'atan2': 2, 'sqrt': 1, 'exp': 1, 'pi': 0, 'duration': 0, 'today': 0, 'now': 0, 'date': 1, 'date-time': 1,
    'decimal-date-time': 1, 'decimal-time': 1, 'format-date-time': 2, 'phone-call-log': 0, 'phone-call-duration': 0, 'collect-is-phone-app': 0,
    'relevant': 1, 'empty': 1, 'if': 3, 'pulldata': 4, 'once': 1, 'coalesce': '2+', 'regex': 2, 'hash': '1+', 'uuid': 0, 'username': 0, 'version': 0,
    'device-info': 0, 'plug-in-metadata': 1}
  
  try{
    var funcUsed = exprPart.match(/[a-z][a-z\-:]+(?= *\()/g); //This regex gets the name of the function used
    var func = funcUsed[0];
  }
  catch(e){
    breakerError("Error getting the function name from: " + exprPart + " on row " + row + ":", e);
    return '';
  }
  
  if (func == 'position') {
    addToWarningLog("On row " + row + ", you use the position() function. While SurveyCTO supports position(..), " + 
                    "it is a legacy function which we have replaced with our own index() function. " +
                    "index() is an altogether superior function which is a bit more efficient than position(..) in terms of memory demands" +
                    "(noticeable in long forms with many repeat groups) and it doesn't suffer from a significant flaw: position(..) " + 
                    "will fail to return the position or index number, if it is inside a non-repeating group that is itself, " +
                    "inside a repeating group. This scenario is avoidable but given that we have added index(), there's every reason to use it " +
                    "instead of position(..). We recommend that you find and replace each instance of position(..) in your form with index().<br>" +
                    "Click <a onclick=\"characterReplace('position(..)', 'index()')\" href='javascript:void(0);'>here</a> to automatically replace all " +
                    "instances of position(..) with index().");
  } else { // Function is not position
    try {
      var numParams = functionDict[func] //Number of parameters the expression SHOULD have.
      try {
        var numParamsUsed; //Number of parameters in the given expression
        
        var allCommas = exprPart.match(/,/g); //Number of parameters is num commas + 1
        
        if(exprPart.replace(/[ \n]/, '') == (func + '()')){ //Empty, so no parameters
          numParamsUsed = 0;
        }
        else if(allCommas == null){ //There is something there, but no commas, so only one parameter
          numParamsUsed = 1;
        }
        else{
          numParamsUsed = allCommas.length + 1; //Number of parameters is num commas + 1
        }
        
        if(typeof(numParams) == 'string'){ //String if includes a +, meaning it needs at LEAST x parameters
          numParams == parseInt(numParams.substring(0, 1))
          if(numParams > numParamsUsed){
            var pluralUsed, pluralNeed
            numParamsUsed == 1 ? pluralUsed = '' : pluralUsed = 's'
            numParams == 1 ? pluralNeed = '' : pluralNeed = 's'
            addToErrorLog("On row " + row + ", you use the " + func + "() function, but you only have " + numParamsUsed +
                          " parameter" + pluralUsed + ". Please make sure it has at least " + numParams + " parameter" + pluralNeed + ".");
          }
        }
        else if(numParams != numParamsUsed){ //Function takes set number of parameters, but expression does not have that number of parameters
          var pluralUsed, pluralNeed
          numParamsUsed == 1 ? pluralUsed= '' : pluralUsed = 's'
          numParams == 1 ? pluralNeed = '' : pluralNeed = 's'
          addToErrorLog("On row " + row + ", you use the " + func + "() function, but you have " + numParamsUsed +
                        " parameter" + pluralUsed + ". Please make sure it has " + numParams + " parameter" + pluralNeed + ".");
        } //End not correct num of parameters
      } catch (e) { // Error other than function not found
        breakerError("Error while retrieving expression information:", e);
      } // Done with other function checks
    } catch (e) { // Catch error if no function with that name
      addToErrorLog("On row " + row + ", you use the " + func + "() function, but there is no function with that name. Check out " +
                    "our documentation on <a target='_blank' href='https://docs.surveycto.com/02-designing-forms/01-core-concepts/09.expressions.html'>using " +
                    "expressions</a> for a list of functions you can use.");
    } finally {
      return funcUsed;
    } // End check if function exists
  } // End function not "position"
} //END functionVer


function checkFieldsExist(exprPart, curField, fields, func, row){ //func is needed for ind-rep check
  try{
    //NEED TO ADD CIRCUMSTANCES FOR ENTERING A CHOICE
    var fieldsUsed = String(exprPart).match(/[$]{[a-zA-Z0-9._-]+}/g); //All fields in expression with ${}
    
    if(fieldsUsed != null){ //True if fields were found
      var numFieldsUsed = fieldsUsed.length;
      for(var a = 0; a < numFieldsUsed; a++){
        try{
          var field = fieldsUsed[a].replace(/[${}]/g, ''); //All fields used in the expression WITHOUT ${}
          var fieldInfo = fields[field];
          
          if(fieldInfo == null){
            addToErrorLog("On row " + row + ", you call for the field '" + field + "', but there is no field with that name.");
            //Logger.log("Field: " + field);
            //Logger.log(fields);
          }
          else if((func != 'indexed-repeat') && (func != 'count') && (func != 'sum') && (func != 'join') && (func != 'min') && (func != 'max') &&
            (func != 'count-if') && (func != 'sum-if') && (func != 'join-if') && (func != 'min-if') && (func != 'max-if') &&
            !((func == 'rank-index') && (a == 1)) && (func != 'area')){
            //This checks if it should be in an indexed-repeat() expression
            
            var choiceAddon = "";
            if(typeof curField == 'string'){ //If it is not a field that is being checked, the 'curField" field should be a string.
              var curPath = [];
            }
            else if(curField.name != null){
              var fn = curField.name; //field name
              var fi = fields[fn]; //field info
              var curPath = fi.path; //Path of the current expression/field.
            }
            else{
              addToAppLog("Report to developer: On row " + row + ", a field is being checked, but that field does not exist. " +
                          "Please report this error, sending your spreadsheet form definition.<br>Error code: FE-NE");
            }
            
            var refPath = fieldInfo.path; //Path of the field referenced
            ////Logger.log("For the field " + fieldRefName + ", its path is " + refPath + ", and the current path is " + path);
            ////Logger.log("All paths: " + fieldPaths);
            
            if(row == 114){ //TESTING ONLY
              //Logger.log("On row " + row + ".");
            }
            
            ////Logger.log("<br><br>Field: " + field + "<br>Current path: " + curPath + "<br>Referenced path: " + refPath);
            if((refPath.length > 0) && needIndRep(curPath, refPath)){
              
              //True if the path of the current field and the path of the referenced field do not match up well enough.
              //Already checked the i-r() exprs, so this is an error.
              addToErrorLog("On row " + row + choiceAddon + ", you mention the field '" + field +
                            "'. However, that field is in a different repeat group. " +
                            "Use an indexed-repeat() expression like this to reference that field:<br>" +
                            getIndRepExpr(field, refPath));
            } //End paths not equal
          } //End indexed-repeat check
        } //End TRY
        catch(e){
          breakerError("Error checking field number " + (a + 1) + " of the expression \"" + exprPart + " for the field \"" + curField + ".", e);
        }
      } //End FOR loop checking each field in the expression.
    } //End fields found
  } //End TRY
  catch(e){
    breakerError("", e);
  }
} //END checkFieldsExist


function otherExprCheck(exprPart, fields, row){
  try{
  var operatorRegex = / *([+\-*]|div|mod|=|=!|>|>=|<|<=|or|and) */;
  
  
  if((exprPart.charAt(0) == '(') && (exprPart.charAt(exprPart.length - 1) == ')')){
    exprPart = exprPart.substring(1, exprPart.length - 1); //Cuts out beginning and ending paratheses
  }
  
  
  if((exprPart == '') && (typeof exprPart != 'number')){
    return []; //No need to check if nothing is there.
  }
  else{
    var args = exprPart.match(/[^,]+/g); //Gets parts that are between the commas so each can be individually tested
    var numArgs = args.length;
    
    for(var a = 0; a < numArgs; a++){
      args[a] = args[a].match(/[^ ]+.*[^ ]+|[^ ]/); //Removed the starting and ending spaces
      
      if(args[a] == null){
        addToErrorLog("On row " + row + ", within '" + exprPart + "', there is a blank argument. Make sure all arguments have content.");
        continue;
      }
      else if(args[a].length > 1){
        addToAppLog("On row " + row + ", within '" + exprPart + "', there was an error when trying to check between the " +
                    "leading and ending spaces of the expression. Please report this error to the developer, sending your form definition.<br>" +
                    "Error code: EC-OEC");
      }
      
      //HERE WILL GO SOME OTHER CHECKS
    } //End FOR loop through each part
    
    
    return args;
  } //End not blank
  }
  catch(e){
    breakerError("Error performing additional error checks on the expression \"" + exprPart + "\" on row " + row + ".");
  }
} //END otherExprCheck

