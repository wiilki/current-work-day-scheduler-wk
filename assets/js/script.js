
$(function () {
  var template = document.getElementById("hour-row-template").innerHTML;
  var container = $('#container');
  var taskArray = [];
  // Get stored taskArray from localStorage
  var storedTasks = JSON.parse(localStorage.getItem("current-tasks"));

  console.log(storedTasks)

  // Duplicates original template and appends to container
  function tempToCont() {
    $('#container').append(template)
  }

  // Adds template content to container 9 times
  for (i = 0; i < 9; i++) {
    tempToCont();
  };

  // Adds each value of storedTasks back to corresponding textarea
  for (j = 0; j < 9; j++) {
    var containerEl = document.getElementById("container");
    containerEl.children[j + 1].children[0].children[1].append(storedTasks[j])
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

    // Change time display format
    if (d.getHours() < 12) {
      this.append(d.getHours() + "AM");
    } else if (d.getHours() > 12) {
      this.append(d.getHours() - 12 + "PM");
    } else {
      this.append(d.getHours() + "PM");
    }
    startHour++;
  });

  // Set startHour back to 9. Add class to rows
  var startHour = 9;
  $('section').each(function () {
    var currentDate = new Date();
    const d = new Date();
    d.setHours(startHour, 0, 0);
    // Compare display hour to currentHour and add class appropriately
    if (d.getHours() < currentDate) {
      this.classList.add('past');
    } else if (d.getHours() > currentDate) {
      this.classList.add('future');
    } else {
      this.classList.add('present');
    }
    startHour++;
  });

  // Listener for the save button
  function handleFormSubmit(event) {
    // Clears currently store taskarray from local storage
    localStorage.clear();
    // Goes through each description input element and adds to array
    $('section').each(function () {
      var descriptionInput = this.children[1].value;
      taskArray.push(descriptionInput);
    });
    // Stringify updated taskarray and save to local storage
    localStorage.setItem("current-tasks", JSON.stringify(taskArray))
  }
  // Create a submit event listener on the form element
  container.on('submit', handleFormSubmit);
});