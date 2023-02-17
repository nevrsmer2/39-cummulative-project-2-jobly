
const { BadRequestError } = require("../expressError");


// dataToUpdate receives argument {} containing new values {key1: newValue, ...}
// Object.keys extracts keys from key:value pairs and sets them as values in a array name 'keys'
// keys.map maps to the corresponding DB column name and sets to the variable $+1 (incrementing each numerical value by one, representing each new value)
//  The return statement returns the keys and values  in the cols[] as a  key:value pairs separated by a comma.  Object.values extract the values to ber updated from the frist argument and puts then in an [] in the query string. (SetCols contains an array of query strings --> "first_name"=$1'
//  Values is an array of data values that the $1 variable represents ['David', 30]

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
    const keys = Object.keys(dataToUpdate);
    if (keys.length === 0) throw new BadRequestError("No data");
    const cols = keys.map((colName, idx) =>
        `"${jsToSql[colName] || colName}"=$${idx + 1}`,
    );
    return {
        setCols: cols.join(", "),
        values: Object.values(dataToUpdate),
    };
}



module.exports = { sqlForPartialUpdate };
