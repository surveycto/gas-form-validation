function aFTest(){
  autoReplace(' ', '  ')
}


function characterReplace(original, replacement, originalDisp, replacementDisp){
  try{
  if(originalDisp == null){
    originalDisp = "'" + original + "'";
  }
  
  if(replacementDisp == null){
    replacementDisp = "'" + replacement + "'";
  }
  
  var ui = SpreadsheetApp.getUi()
  
  var response = ui.alert("Are you sure you would like to replace all instances of " + originalDisp + " with " + replacementDisp + "?",
                          ui.ButtonSet.YES_NO);
  
  if(response == ui.Button.YES){
    var replacer = autoReplace(original, replacement);
    ui.alert("Success! There were " + replacer + " replacements made. To undo this change, close this window and press Ctrl/Cmd + Z",
             ui.ButtonSet.OK);
  }
  else{
    ui.alert("No changes were made.", ui.ButtonSet.OK);
  }
  }
  catch(e){
    SpreadsheetApp.getUi().alert("Error running the character replacement. Please report to developer.\n" + e);
  }
}


function characterReplaceSpecial(original, replacement){
  try{
    var o = String.fromCharCode(original);
    var r = String.fromCharCode(replacement);
    
    characterReplace(o, r, o, r);
  }
  catch(e){
    SpreadsheetApp.getUi().alert("Error running a special character replacement. Please report to developer.\n" + e);
  }
}

function getUnicodeGlyph(code){
  if(/[0-9]+/.test(code)){
    return String.fromCharCode(code);
  }/*
  else if(/^U\+[0-9]+$/.test(code)){
    
    var num = 0;
    try{
      num = parseInt(code.substring(2));
    }
    catch(e){
      addToAppLog("There was an issue turning the code " + code + "into a unicode character. Please report to developer.");
    }
    
    return String.fromCharCode(num);
  }
  */else{
    return code;
  }
}


//Leading and ending space remover
function leSpaceRemover(){
  var ui = SpreadsheetApp.getUi()
  
  try{
  var response = ui.alert("Are you sure you would like to replace all leading and ending spaces? " +
                          "This will happen for all three sheets for all rows and columns.",
                          ui.ButtonSet.YES_NO);
  
  if(response == ui.Button.YES){
    var replacer = autoReplace('^ | $', '', true);
    ui.alert("Success! There were " + replacer + " replacements made. To undo this change, close this window and press Ctrl/Cmd + Z",
             ui.ButtonSet.OK);
  }
  else{
    ui.alert("No changes were made.", ui.ButtonSet.OK);
  }
  }
  catch(e){
    ui.alert("Error while removing leading and ending spaces.\n" + e);
  }
}


function autoReplace(original, replacement, useRegex){ //Replace position(..) with index(..)
  var replacer = 0;
  Logger.log("useRegex:", useRegex, typeof useRegex);
  if(useRegex != true){
    useRegex = false;
  }
  
  var error = false;
  
  try{
  var spreadsheet = SpreadsheetApp.getActive();
  
  //var id = '1Q7sgVMikwa0gRq2_XrxBM2lsTp5kLdxZ04e_Md-ttgE';
  //var spreadsheet = SpreadsheetApp.openById(id);
  Logger.log("useRegex:", useRegex);
  
  
  var sheets = [spreadsheet.getSheetByName('survey'),
                spreadsheet.getSheetByName('choices'),
                spreadsheet.getSheetByName('settings')];
  }
  catch(e){
    SpreadsheetApp.getUi().alert("Error running a replacement. Please report to developer.\n" + e);
  }
  
  try{
    //ui.alert("Made " + replacer + " replacements so far.");
    replacer += sheets[0].createTextFinder(original).useRegularExpression(useRegex).replaceAllWith(replacement);
    //ui.alert("Made " + replacer + " replacements so far.");
    replacer += sheets[1].createTextFinder(original).useRegularExpression(useRegex).replaceAllWith(replacement);
    //ui.alert("Made " + replacer + " replacements so far.");
    replacer += sheets[2].createTextFinder(original).useRegularExpression(useRegex).replaceAllWith(replacement);
    //ui.alert("Made " + replacer + " replacements so far.");
  }
  catch(e){
    var error = true;
    breakerError("There was an error with the character replacement. Please report this error to the developer.", e);
    return 0;
  }
  if(!error){
    //ui.alert("Made " + replacer + " replacements so far.");
    return replacer;
  }
} //END replacePosWithIndex
