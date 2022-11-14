
$(function () {
  var template = document.getElementById("hour-row-template").innerHTML;
  var container = $('#container');
  var taskArray = [];
  var startHour = 9;
  var dayRange = 9;
  // Get stored taskArray from localStorage
  var storedTasks = JSON.parse(localStorage.getItem("current-tasks"));

  // Today's Date
  var today = dayjs();
  // Add today's date to header
  $('#currentDay').text(today.format('dddd, MMMM D'));

  function resetHour() {
    startHour = 9;
  }

  // Duplicates original template and appends to container
  function tempToCont() {
    $('#container').append(template)
  }

  // Adds template content to container 9 times
  for (i = 0; i < dayRange; i++) {
    tempToCont();
  };

  // Adds each value of storedTasks back to corresponding textarea
  for (j = 0; j < dayRange; j++) {
    var containerEl = document.getElementById("container");
    if (storedTasks) {
      containerEl.children[j + 1].children[0].children[1].append(storedTasks[j])
    }
  };

  // Set id to each section inside container and increments id#
  resetHour();
  $('form').each(function () {
    const hourEl = new Date();
    hourEl.setHours(startHour);
    this.setAttribute("id", "hour-" + startHour);
    startHour++;
  });

  // Set startHour back to 9. Append hour displays to rows
  resetHour();
  $('section div').each(function () {
    const hourEl = new Date();
    hourEl.setHours(startHour);

    // Change time display format
    if (hourEl.getHours() < 12) {
      this.append(hourEl.getHours() + "AM");
    } else if (hourEl.getHours() > 12) {
      this.append(hourEl.getHours() - 12 + "PM");
    } else {
      this.append(hourEl.getHours() + "PM");
    }
    startHour++;
  });

  // Set startHour back to 9. Add class to rows
  resetHour();
  $('section').each(function () {
    const hourEl = new Date();
    hourEl.setHours(startHour);
    var today = new Date();

    // Compare display hour to currentHour and add class appropriately
    if (hourEl < today) {
      this.classList.add('past');
    } else if (hourEl > today) {
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
    // Goes through each description input element and adds to array even if text is blank
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