var showVer = false;

var errors = '';
var warnings = '';
var appLog = '';
var testLogs = ''

function onOpen(e){
  SpreadsheetApp.getUi().createAddonMenu()
      .addItem('Open validation panel', 'displaySidebar')
      .addToUi();
}

function onInstall(e) {
  onOpen(e);
}

function displaySidebar(ranValidate){
  showVer = ranValidate;
  
  testingSidebar("About to create the sidebar");
  var ui = SpreadsheetApp.getUi();
  try{
  testingSidebar("Got the UI");
  var sidebar = createSidebar('interface', 'SurveyCTO form validation')
  
  testingSidebar("Created the sidebar");
  /*if(ranValidate){
    var expansion = gatherLogs();
    //sidebar = expandSidebar(sidebar, expansion);
  }*/
  testingSidebar("About to show the sidebar");
  ui.showSidebar(sidebar)
  }
  catch(e){
    ui.alert("Error. Please report to developer.\n" + e);
  }
  
}

function createSidebar(file, title){
  /*var sidebar = HtmlService
    .createTemplateFromFile(file)
    .evaluate()
    .setTitle(title);*/
  
  var template = HtmlService.createTemplateFromFile(file);
  testingSidebar("Created template");
  var evaluated = template.evaluate();
  testingSidebar("Evaluated");
  var sidebar = evaluated.setTitle(title);
  testingSidebar("Set title");
  
  return sidebar;
}

function gatherLogs(){
  var expansion = '';
  
  
  if(errors == ''){
    expansion += '<div class="good"><p>No errors found!</p>\n';
  }
  else{
    expansion += '<div class="errorlogs"><p>ERRORS</p>\n<ol>\n' + errors + "</ol>\n";
  }
  
  expansion += "</div>"
  
  if(warnings == ''){
    expansion += '<div class="good"><p>No warnings found!</p>\n';
  }
  else{
    expansion += '<div class="warninglogs"><p>WARNINGS</p>\n<ol>\n' + warnings + "</ol>\n";
  }
  
  expansion += '</div>';
  
  if(appLog != ''){
    expansion += '<div class="errorlogs"><p>Application errors</p>\n' + appLog;
    SpreadsheetApp.getUi().alert("There were errors while using this application. Please see the logs for more information.");
  }
  
  expansion += '</div>';
  
  Logger.log(expansion)
  testingSidebar("Completed building the log.");
  return expansion;
}

function expandSidebar(sidebar, expansion){
  sidebar.append(expansion);
  return sidebar;
}


function clearButton(){
  if(showVer){
    return '<button class="clear" onclick="clearedSidebar()">Clear logs</button></p>';
  }
  else{
    return '';
  }
}

////////////////////////
//For adding to the logs
function addToErrorLog(message){
  errors += '<li>' + message + '</li>\n';
}

function addToWarningLog(message){
  warnings += '<li>' + message + '</li>\n';
}

function addToAppLog(message){
  appLog += '<li>' + message + '</li>\n';
}

function testingSidebar(point){ //Updates the sidebar for testing purposes
  testLogs += '<p>' + point + '</p>';
  Logger.log(point);
  //SpreadsheetApp.getUi().showSidebar(HtmlService.createHtmlOutput(testLogs));
}


//For error messages that break the app
function breakerError(errorMessage, e){
  Logger.log(e);
  if(e == null){
    e = "No error details given";
  }
  var errorMessage = errorMessage + "\n<br>" + e;
  /*//var htmlOutput = HtmlService.createHtmlOutput(errorMessage);
  var ui = SpreadsheetApp.getUi();
  ui.alert(errorMessage);*/
  addToAppLog(errorMessage);
}

/////////////////
function testEvalHTMLScript(){
  validation();
  gatherLogs();
  showVer = true;
  var template = HtmlService.createTemplateFromFile('interface');
  testingSidebar("Created template");
  var evaluated = template.evaluate();
  testingSidebar("Evaluated");
  var sidebar = evaluated.setTitle('title');
  testingSidebar("Set title");
  Logger.log(sidebar.getContent());
}
