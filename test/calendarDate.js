var currentDate = new Date();
currentDate.setDate(currentDate.getDate());
var today = currentDate.toISOString().slice(0, 10);
console.log(today);

var deadline = "2019-08-07";
var ctoday = "2019-08-06";

if (deadline >= ctoday) {
    console.log("Within the deadline");
} else {
    console.log("Missed the deadline");
}

var newDate = new Date("2019-08-28T23:00:00.000Z");
newDate.setDate(newDate.getDate());
var newtoday = newDate.toISOString().slice(0, 10);
console.log(newtoday);