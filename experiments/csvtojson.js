let csvToJson = require('convert-csv-to-json');

let json = csvToJson.fieldDelimiter(',').formatValueByType().getJsonFromCsv("./test.csv");
for (let i = 0; i < json.length; i++) {
    console.log(JSON.stringify(json[i]));
}