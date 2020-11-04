# Google Sheet add-on for SurveyCTO spreadsheet form validation

This repository stores the source code for the add-on you can use to validate your spreadsheet form definition in Google Sheets. For the full documentation, check out [this support article](https://docs.google.com/document/d/17WmRK_VsN6QrED7TRi4l3WRf3UdmlSp1-qqMMWakqhI/edit?usp=sharing). For a complete list of validations performed by the add-on, check out [this page](/extras/validations.md).

The add-on was created using Google app scripts. Here is a list of the files used, which can all be found in the [source](/source/) folder:

**AutoFixes.gs**: Functions to automatically perform fixes when confirmed.  
**ChoicesValidation.gs**: Functions for validating the *choices* sheet.  
**ExpressionChecks.gs**: Functions for validating field properties that use expressions, such as *relevance*, *constraint*, and *calculation*.  
**FuncExprVal.gs**: Functions for validating specific types of SurveyCTO functions. Currently, it is only used to validate the [indexed-repeat() function](https://docs.surveycto.com/02-designing-forms/01-core-concepts/09.expressions.html#Help_Forms_indexedrepeat).  
**GenericFunctions.gs**: Generic functions that are not specifally for SurveyCTO forms, but can be helpful in other scripts as well.
**HeaderVal.gs**: Functions used to make sure the needed headers are used on each sheet of the form definition.  
**interface.html**: Template for the sidebar interface.  
**Main.gs**: Stores the function that is activated when the validation is run, as well as other upper-level functions.  
**MoreFunctions.gs**: Functions that don't belong in any other file.  
**SettingsValidation.gs**: Functions for validating the *settings* sheet.  
**SidebarCode.gs**: Functions and variables used by the sidebar.  
**SurveyValidation.gs**: Functions for validating the *survey* sheet.
