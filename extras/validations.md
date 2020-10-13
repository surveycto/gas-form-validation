# Validations performed by the add-on

This is a complete list of validations performed by the Google Sheet add-on. You can find the full documentation [here]().

## General

* Confirm survey, choices, and settings sheets exist
* Check for invalid characters
* Other warning checks

## *survey* sheet

* Confirm needed column headers are included
* Check field types used
* Find missing types
* Confirms select_one and select_multiple fields have valid list names
* Confirm matching begin and end type fields
* Confirm a repeat does not end when a normal group should, and vice-versa
* Check for missing field names
* Check for field name doubles
* Confirm valid field names are used
* Confirm all visible fields have labels
* Confirm existence of all called fields
* Confirm called fields are in the proper format (such as missing $)
* Confirm visible fields all have labels
* Confirm fields with 'label' appearance are not sometimes required
* Confirm calculate fields have valid calculations
* Confirm all single quotes come in pairs.
* Confirm there are no double quotes, and when confirmed, replaces double quotes with single quotes.
* Confirm functions used exist
* Confirm functions take correct number of parameters
* Indexed-repeat() check, including checking if they are needed, and if the used expressions are correct, including giving what the expression should be
* Detect use of the position() function, and when confirmed, replace instances of position(..) with index()

## *choices* sheet

* Check choices sheet headers
* Check for missing list name if other content in that row
* Confirm valid list names
* Check for re-used values in the same list
* Check for re-used labels in the same list
* Confirm valid values (including if it is a field call, that the field call is by itself)
* Indexed-repeat() checks
* Check for missing labels

## *settings* sheet
* Confirm presence of all needed columns
* Confirm form ID is in correct format
* Check if the recommended version formula was used (even if it has had numbers added to it)
* Check if public key starts correctly
* Verify instance_name format is correct