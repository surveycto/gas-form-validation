//Validate SurveyCTO forms in Google Spreadsheets
//By Max S. Haberman
//© 2020 Dobility, Inc

function validation() {
  var fields = {};
  //Logger.log("Starting");
  testingSidebar("Starting validation");
  var spreadsheet = SpreadsheetApp.getActive();
  
  if(spreadsheet == null){ //For testing
    var id = '1xlHHhRBC02eGI1BkQx2e5sh9dADf9ftdaROD9bbfW6A';
    var spreadsheet = SpreadsheetApp.openById(id);
  }
  else{
    var id = null;
  }
  
  try{
    //survey sheet, getting all cell values
    var surveySheet = spreadsheet.getSheetByName('survey');
    if(surveySheet == null){
      addToErrorLog("Missing sheet 'survey'.")
    }
    else{
      var surveyRange = surveySheet.getDataRange();
      var surveyValues = surveyRange.getValues();
      checkInvalid(surveyValues, 'survey');
    }
  }
  catch(e){
    breakerError("Unable to get <i>survey</i> sheet.", e);
  }
  
  try{
    //choices sheet, getting all cell values
    var choicesSheet = spreadsheet.getSheetByName('choices');
    if(choicesSheet == null){
      addToErrorLog("Missing sheet 'choices'.")
    }
    else{
      var choicesRange = choicesSheet.getDataRange()
      var choicesValues = choicesRange.getValues();
      checkInvalid(choicesValues, 'choices');
    }
  }
  catch(e){
    breakerError("Unable to get <i>choices</i> sheet.", e);
  }
  
  try{
    //settings sheet, getting all cell values
    //Logger.log("Checking settings sheet here");
    var settingsSheet = spreadsheet.getSheetByName('settings');
    if(settingsSheet == null){
      addToErrorLog("Missing sheet 'settings'.");
    }
    else{
      var settingsRange = settingsSheet.getDataRange();
      var settingsValues = settingsRange.getValues();
      checkInvalid(settingsValues, 'settings');
      var settingsFormulas = settingsRange.getFormulas();
      //Logger.log("Completed getting settings info");
    }
  }
  catch(e){
    breakerError("Unable to get <i>settings</i> sheet.", e);
  }
  
  
  try{
    //Begin SURVEY sheet validation
    testingSidebar("Starting survey check...");
    var fieldNamesPaths;
    if(surveySheet != null){
      var headers = getHeaders(surveyValues);
      var headerPosition = headerOrder(headers,
                                       ['type', 'name', ['label','question']], //Required headers
                                       ['hint','default','appearance','constraint','constraint message','relevance','required',
                                        'calculation','repeat_count','choice_filter'], //Recommended headers
                                       ['disabled'],
                                       'survey'); //Name of sheet
      //Logger.log("Header check complete")
      if(choicesSheet == null){
        var lists = [];
      }
      else{
        var lists = getLists(choicesValues);
      }
      //Logger.log("Lists complete");
      
      if(settingsSheet == null){
        var defLang = null;
      }
      else{
        var defLang = getDefLang(settingsValues);
      }
      
      fields = surveySheetVer(surveyValues, headerPosition, lists, defLang);
      if(fields == 'stop'){
        displaySidebar(true); //IMPORTANT: Shows the results
        return;
      }
      //Logger.log("End SURVEY check");
    } //End SURVEY sheet check
  } //End TRY
  catch(e){
    breakerError("Error running the <i>survey</i> sheet validation.", e);
  }
  
  
  try{
    //Begin CHOICES sheet validation
    //Logger.log("Checking choices sheet");
    testingSidebar("Starting choices check...");
    if(choicesSheet != null){
      var headers = getHeaders(choicesValues);
      var headerPosition = headerOrder(headers,
                                       [['list_name', 'list name'], ['value', 'name'], 'label'], //Required headers
                                       ['image', 'filter'],
                                       ['disabled'],
                                       'choices'); //Name of sheet
      ////Logger.log(headerPosition);
      
      testingSidebar("About to start choices sheet validation");
      choicesSheetVer(choicesValues, headerPosition, fields, defLang);
    } //End CHOICES sheet check
  }
  catch(e){
    breakerError("Error running the <i>choices</i> sheet validation.", e);
  }
  
  try{
    //Begin SETTINGS sheet validation
    testingSidebar("Checking settings sheet");
    if(settingsSheet != null){
      var headers = getHeaders(settingsValues);
      var headerPosition = headerOrder(headers,
                                       ['form_title', 'form_id', 'version', 'default_language'], //Required headers
                                       [],
                                       ['public_key', 'submission_url', 'instance_name'],
                                       'settings'); //Name of sheet
      
      testingSidebar("About to start settings ver");
      settingsSheetVer(settingsValues, settingsFormulas, headerPosition, fields);
    } //End SETTINGS sheet check
  }
  catch(e){
    breakerError("Error running the <i>settings</i> sheet validation.", e);
  }
  
  
  testingSidebar("Completed checks");
  if(id == null){ //Can remove this for the actual publishing
    displaySidebar(true); //IMPORTANT: Shows the results
  }
  else{
    Logger.log("\n" + errors + "\n" + warnings + "\n" + appLog + "\n" + testLogs);
  }
} //End validation




function surveySheetVer(surveyValues, headerOrder, lists, defLang){
  //Logger.log("Beginnning survey sheet ver");
  try{
    //type, name, label, //Required
    //hint,default,appearance,constraint,constraint message,relevance,required, calculation,repeat_count,choice_filter //Recommended
    typeVer(surveyValues, headerOrder, lists);
    //Logger.log("Completed type ver");
    var fields = nameVer(surveyValues, headerOrder);
    //Logger.log("Completed name ver");
    if(fields == 'stop'){ //For error handling
      return 'stop';
    }
    /*var fields = fieldsWithIndexes[0];
    var fieldIndexes = fieldsWithIndexes[1];*/
    
    //Logger.log("LABEL");
    labVer(surveyValues, headerOrder[2], fields, defLang);
    //Logger.log("DEFAULT");
    exprVer('def', fields, headerOrder[4]); //Default
    //Logger.log("CONSTRAINT");
    exprVer('constraint', fields, headerOrder[6]); //Constraint
    //Logger.log("RELEVANCE");
    exprVer('relevance', fields, headerOrder[8]); //Relevance
    //Logger.log("REQUIRED");
    exprVer('required', fields, headerOrder[9]); //Required
    //Logger.log("CALCULATION");
    exprVer('calculation', fields, headerOrder[10]); //Calculation
    //Logger.log("REPEAT COUNT");
    exprVer('repeat_count', fields, headerOrder[11]); //Repeat count
    
    testingSidebar("End survey sheet ver");
  }
  catch(e){
    breakerError("Error while attempting to run the <i>survey</i> sheet validation.", e);
  }
  finally{
    return fields;
  }
}


function choicesSheetVer(choicesValues, headerOrder, fields, lists, defLang){
  try{
    testingSidebar("Starting choice sheet ver");
    ////Logger.log("CHOICES: LIST_NAME");
    listNameVer(choicesValues, headerOrder);
    ////Logger.log("CHOICES: VALUE");
    valueVer(choicesValues, headerOrder, fields);
    ////Logger.log("CHOICES: LABEL");
    choicesLabVer(choicesValues, headerOrder, fields, defLang);
    ////Logger.log("CHOICES: FILTER");
    filterVer(choicesValues, headerOrder);
    testingSidebar("Done choices sheet ver");
  }
  catch(e){
    breakerError("Error while attempting to run the <i>choices</i> sheet validation.", e);
  }
  
}

function settingsSheetVer(settingsValues, settingsFormulas, headerPosition, fields){
  try{
    //['form_title', 'form_id', 'version', 'default_language'], //Required headers: 0 1 2 3
    //['public_key', 'submission_url', 'instance_name'] //Recommended headers: 4 5 6
    //default_lang already done above
    
    //titleVer(settingsValues, headerPosition[0]);
    idVer(settingsValues, headerPosition[1]);
    versionVer(settingsValues, settingsFormulas, headerPosition[2]);
    keyVer(settingsValues, headerPosition[4]);
    instanceVer(settingsValues, fields, headerPosition[6]);
    testingSidebar("Completed settings ver");
  }
  catch(e){
    breakerError("Error while attempting to run the <i>settings</i> sheet validation.", e);
  }
}


function getLists(values){ //Returns the list of lists as an array
  try{
    var lists = [];
    var numRows = values.length;
    var listCol = values[0].indexOf('list_name');
    
    if(listCol == -1){ //Could either be 'list_name' or 'list name'
      listCol = values[0].indexOf('list name');
    } //I found that this works while addressing ticket #16384 (Note: remove this comment if publishing
    
    if(listCol == -1){ //No list column
      addToErrorLog("On the 'choices' sheet, there is no 'list_name' column. Be sure to add this column.");
    }
    else{
      //Logger.log(allValues);
      for(var r = 1; r < numRows; r++){
        var listName = values[r][listCol];
        
        var listNameNoLESpaces = listName.match(/[^ ]+.*[^ ]+|[^ ]/);
        
        if(listNameNoLESpaces == null){
          continue;
        }
        
        if(listNameNoLESpaces[0] != listName){
          addToWarningLog("On row " + (r + 1) + " of the 'choices' sheet, for the list name, there is a leading and/or ending space. " +
            "This may cause issues. It is recommended you remove leading and ending spaces. " +
              "Click <a onclick='leSpaceRemover()'>here</a> to do so automatically.");
          listName = listNameNoLESpaces[0];
        }
        
        var contains = lists.indexOf(listName);
        
        if(contains == -1){
          lists.push(listName);
        }
      } //End FOR loop
    } //End list_name found
  } //End TRY
  catch(e){
    breakerError("Error while getting the choice lists.", e);
  }
  finally{
    Logger.log(lists);
    return lists;
  }
} //END getLists
