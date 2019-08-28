// Get current date
var CurrentDate = new Date();
CurrentDate.setDate(CurrentDate.getDate());
var currentDate = CurrentDate.toISOString().slice(0, 10);

console.log(currentDate);

// Deadline date set
var DeadlineDate = new Date();
DeadlineDate.setDate(DeadlineDate.getDate() + 1);
var deadlineDate = DeadlineDate.toISOString().slice(0, 10);

console.log(deadlineDate);

// Deadline is equal to current Date
if (deadlineDate == currentDate) {
    console.log("Deadline has expired");
} else {
    console.log("Offer is still open");
}