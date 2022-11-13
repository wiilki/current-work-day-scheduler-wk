
$(function () {



  var today = dayjs();
  // var reformatDate = dayjs().format('hA');

  var template = document.getElementById("hour-row-template").innerHTML;

  // Duplicates original template and appends to container
  function tempToCont() {
    $('#container').append(template)
  }

  // Adds template content to container 9 times
  for (i = 0; i < 9; i++) {
    tempToCont();
  };

  // Set id to each section inside container and increments id#
  var startHour = 9;
  $('form').each(function () {
    const d = new Date();
    d.setHours(startHour, 0, 0);
    this.setAttribute("id", "hour-" + startHour);
    startHour++;
  });

  // Set startHour back to 9. Append hour displays to rows
  var startHour = 9;
  $('section div').each(function () {
    const d = new Date();
    d.setHours(startHour, 0, 0);
    this.append(d);
    startHour++;
  });


  var taskFormEl = $('#container');
  var taskArray = [];

  $('section div').each(function () {
    const d = new Date();
    d.setHours(startHour, 0, 0);
    this.append(d);
    startHour++;
  });



  // // Listener for the save button
  // function handleFormSubmit(event) {
  //   event.preventDefault();

  //Goes through each textarea element. Adds to array, then resets the value of the area
  // $('textarea').each(function () {
  //   // Take textarea input and push to array
  //   var descriptionInput = $('textarea').val();
  //   taskArray.push(descriptionInput);
  //   // Clears current textarea before going to next textarea
  //   $('textarea').val('')
  // });

  // }

  // // Create a submit event listener on the form element
  // taskFormEl.on('submit', handleFormSubmit);


  $('section div').each(function () {

  });





  var taskFormEl = $('.task-form');
  var taskArray = [];

  // Listener for the save button
  function handleFormSubmit(event) {
    event.preventDefault();


    $('section').each(function () {
      var descriptionInput = this.children[1].value;
      taskArray.push(descriptionInput);
    });

    // Stringify array and save to local storage
    localStorage.setItem("current-tasks", JSON.stringify(taskArray))
  }



  // Create a submit event listener on the form element
  taskFormEl.on('submit', handleFormSubmit);



  console.log(taskArray)













  // Listener for the save button
  // function handleFormSubmit(event) {


  //   // Stringify array and save to local storage
  //   localStorage.setItem("current-tasks", JSON.stringify(taskArray))
  // }


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



  // Create a submit event listener on the form element
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
  //     $('textarea').append(taskArray[i]);
  //   }
  // }

  // init();






});