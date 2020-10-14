# Validations performed by the add-on

This is a complete list of validations performed by the Google Sheet add-on. You can find the full documentation [here]().

### General

* Confirm all three needed sheets are included, survey, choices, and settings.
* No invalid characters are used (e.g. a backspace character)

### survey sheet

* All needed headers are included.
* All field types used are valid.
* There is a matching number of begin group and end group rows, and a matching number of begin repeat and end repeat rows.
* A repeat group does not end when a regular group is supposed to end first, and a regular group does not end when a repeat group is supposed to end first.
* Reference to "group" or "repeat" in the type column includes a begin or end statement.
* If the type is two words or more, ensures the type allows for that, such as select_multiple with a choice list, or text audit.
* If the type is three words or more, ensures it is a speed violation type field.
* All fields that have a type also have a name.
* Field names are not used more than once in the 'name' column, except for when ending a group.
* Field names start with a letter.
* Field names only include valid characters.
* 'label' columns with a colon include language name.
* 'label' columns that are for non-default languages have just one colon.
* Default language name is not used in a 'label' column.
* All visible fields have label values.
* All rows with content also have a type.
* All field types used are valid.
* All rows with a field type also have a field name.
* Field with the "label" appearance (for field lists) are never required.
* calculate and calculate_here fields have a calculation.
* Expressions have an even number of quotation marks.
* Expressions have an even number of parentheses.
* Function expressions have the correct number of parameters.
* All functions used are valid SurveyCTO functions.
* All field references are to fields that exist.
* All field references to fields inside a different repeat group use a valid repeat function, such as the indexed-repeat() or max() functions.
* No arguments are blank, and all arguments have content.
* indexed-repeat() function takes a field reference for its first parameter.
* indexed-repeat() function is used on a repeated field.
* indexed-repeat() function uses field references to groups when needed.
* indexed-repeat() function group reference is by itself.
* indexed-repeat() function does not contain unneeded group references.
* indexed-repeat() function includes all of the group references it needs.

### choices sheet

* All needed headers are included.
* 'list_name' column exists.
* Choice list name used on the survey sheet exists on the choices sheet.
* List names start with a letter.
* List names use valid characters.
* Choice values are not re-used in the same choice list.
* Field references in the 'value' column are by themselves (e.g. ${field} value is invalid, but ${field} is fine).
* All field references are to fields that exist.
* Field references are not to repeated fields.
* Rows with a list name also have a 'value'.
* Column header that starts with "label" contains a colon to indicate it is for a translation.
* Default language name is not used in a 'label' column.
* Rows with a list name also have a label value.

### settings sheet

* All needed headers are included.
* A default_language is set.
* Form ID starts with a letter.
* Form ID uses valid characters.
* Encryption key, if included, does not begin with BEGIN PUBLIC KEY.

## Warning types

This is a complete list of checks performed for warnings. If any of these are violated, it will be added to the list of warnings.

### survey sheet

* Recommended headers are included.
* A cell does not contain a space by itself (only checks properties that take expressions, such as relevance and calculation).
* label columns do not include more than one colon.
* Field names do not include uppercase letters or dots.
* repeat_count does not have a value when the row is not a begin repeat.
* Only single quotes are used, not double quotes.
* position(..) function is not used.

### choices sheet

* Recommended headers are included.
* List names do not have leading or trailing spaces.
* Rows with content also have a list name.
* List name does not contain capital letters or dots.
* List name does not re-start on a row after it had already been ended (i.e. a series of rows for one list does not have choices for another list in-between).
* value is not just one or more spaces.
* label column does not contain more than one colon.
* label value is not re-used in the same choice list.

### settings sheet

* Recommended headers are included.
* Form ID does not contain uppercase letters or dots.
* Form version uses the recommended formula.
