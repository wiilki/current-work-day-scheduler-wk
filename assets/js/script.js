
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
    
    // Change time display
    if (d.getHours() < 12){
      this.append(d.getHours() + "AM");
    } else if (d.getHours() > 12) {
      this.append(d.getHours()-12 + "PM");
    } else {
      this.append(d.getHours() + "PM");
    }
    startHour++;
  });



  var container = $('#container');
  var taskArray = [];

  // Listener for the save button
  function handleFormSubmit(event) {

    // Clears currently store taskarray from local storage
    localStorage.clear();

    // Goes through each
    $('section').each(function () {
      var descriptionInput = this.children[1].value;
      taskArray.push(descriptionInput);
    });
    // Stringify updated taskarray and save to local storage
    localStorage.setItem("current-tasks", JSON.stringify(taskArray))
  }

  // Create a submit event listener on the form element
  container.on('submit', handleFormSubmit);





  // function init() {
  //   // Get stored taskArray from localStorage
  //   var storedTasks = JSON.parse(localStorage.getItem("current-tasks"));

  //     taskArray = storedTasks;

  //   // // For the length of the stored array
  //   // for (var i = 0; i < taskArray.length; i++) {

  //   //   // Test code
  //   //   $('textarea').append(taskArray[i]);
  //   // }
  //   console.log(storedTasks)
  // }



  // init();






});