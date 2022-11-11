// Wrap all code that interacts with the DOM in a call to jQuery to ensure that
// the code isn't run until the browser has finished rendering all the elements
// in the html.
$(function () {
  // TODO: Add a listener for click events on the save button. This code should
  // use the id in the containing time-block as a key to save the user input in
  // local storage. HINT: What does `this` reference in the click listener
  // function? How can DOM traversal be used to get the "hour-x" id of the
  // time-block containing the button that was clicked? How might the id be
  // useful when saving the description in local storage?
  //
  // TODO: Add code to apply the past, present, or future class to each time
  // block by comparing the id to the current hour. HINTS: How can the id
  // attribute of each time-block be used to conditionally add or remove the
  // past, present, and future classes? How can Day.js be used to get the
  // current hour in 24-hour time?
  //
  // TODO: Add code to get any user input that was saved in localStorage and set
  // the values of the corresponding textarea elements. HINT: How can the id
  // attribute of each time-block be used to do this?
  //
  // TODO: Add code to display the current date in the header of the page.


  var today = dayjs();
  var reformatDate = dayjs().format('hA');
  


  // Hour row div
  var hourRowDiv = $('#hour-id');
  var hourDisplayDiv = $('#hour-display');
  var hourHtml = document.getElementById("container").innerHTML;
  var startHour = 9;


  hourRowDiv.attr("id", "hour-" + startHour);
  hourDisplayDiv.text(startHour + "AM");
  $('#container').append(hourHtml);
  startHour++;



  // var taskFormEl = $('.task-form');
  // var taskArray = [];

  // // Listener for the save button
  // function handleFormSubmit(event) {
  //   event.preventDefault();
  //   // Take textarea input and assign it to object
  //   var descriptionInput = $('textarea').val();
  //   var taskInfo = {
  //     taskDescription: descriptionInput,
  //   }
  //   // Push object to array
  //   taskArray.push(taskInfo);
  //   // Stringify array and save to local storage
  //   localStorage.setItem("current-tasks", JSON.stringify(taskArray))
  // }




  // // Create a submit event listener on the form element
  // taskFormEl.on('submit', handleFormSubmit);

  // function init() {
  //   // Get stored taskArray from localStorage
  //   var storedTasks = JSON.parse(localStorage.getItem("current-tasks"));
  //   if (storedTasks !== null) {
  //     taskArray = storedTasks;
  //   }
  //   // For the length of the stored array
  //   for (var i = 0; i < taskArray.length; i++) {

  //     // Test code
  //     console.log(taskArray[i]);
  //   }
  // }

  // init();






});