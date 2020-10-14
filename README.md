# Google Sheet add-on for SurveyCTO spreadsheet form validation

This repository stores the source code for the add-on you can use to validate your spreadsheet form definition in Google Sheets. For the full documentation, check out [this support article](). For a complete list of validations performed by the add-on, check out [this page](/extras/validations.md).

The add-on was created using Google app scripts. Here is a list of the files used:
**AutoFixes.gs**: Functions to automatically perform fixes when confirmed.
**ChoicesValidation.gs**: Functions for validating the *choices* sheet.
**ExpressionChecks.gs**: Functions for validating field properties that use expressions, such as *relevance*, *constraint*, and *calculation*.
**FuncExprVal.gs**: Functions for validating specific types of SurveyCTO functions. Currently, it is only used to validate the indexed-repeat() function.
**GenericFunctions.gs**: Generic functions that are not specifally for SurveyCTO forms, but can be helpful in other scripts as well.
**HeaderVal.gs**: Functions used to make sure the needed headers are used on each sheet of the form definition.
**interface.html**: Template for the sidebar interface.
**Main.gs**: Stores the validation() function that is activated when the verification is run, as well as other upper-level functions.
**MoreFunctions.gs**: Functions that don't belong in any other file.
**SettingsValidation.gs**: Functions for validating the *settings* sheet.
**SidebarCode.gs**: Functions and variables used by the sidebar.
**SurveyValidation.gs**: Functions for validating the *survey* sheet.
