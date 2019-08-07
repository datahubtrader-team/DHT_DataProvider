// const today = new Date();
// const ee = today.setTime(today.getDay() - 7);
// console.log(ee);

const tod = new Date("2019-07-01T17:15:21.607Z").toISOString();

const date = tod.split("T")[0];

//console.log(date);

//Current date
const current = new Date("2019-07-01T17:15:21.607Z"); // get current date  
const currentDate = current.toISOString().split("T")[0];
console.log(currentDate);

//Start date of the week
const startoftheweek = current.getDate() - current.getDay() - 6;
const startdate = new Date(current.setDate(startoftheweek));
//console.log(startdate);
const sDate = startdate.toISOString().split("T")[0];
console.log(sDate);

if (startdate >= currentDate) {
    console.log("true");
} else {
    console.log("false");
}

//var endoftheweek = startoftheweek + 6; // end day is the first day + 6 
//var startdate = new Date(current.setDate(startoftheweek));
//var enddate = new Date(current.setDate(endoftheweek));

//console.log(startdate);

// if (today == tod) {
//     console.log(true);
// } else {
//     console.log(false);
// }