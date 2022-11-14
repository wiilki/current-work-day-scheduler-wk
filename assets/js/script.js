$(function () {
  var template = document.getElementById("hour-row-template").innerHTML;
  var container = $('#container');
  var taskArray = [];
  var startHour = 9;
  var dayRange = 9;
  // Today's Date
  var today = dayjs();
  // Get stored taskArray from localStorage
  var storedTasks = JSON.parse(localStorage.getItem("current-tasks"));

  // Add today's date to header
  $('#currentDay').text(today.format('dddd, MMMM D'));

  // Resets start hour back to 9
  function resetHour() {
    startHour = 9;
  }

  // Adds template content to container 9 times
  function addTemplate() {
    // Duplicates original template and appends to container
    for (i = 0; i < dayRange; i++) {
      $('#container').append(template);
    };
  }

  // Adds each value of storedTasks back to corresponding textarea
  function renderArray() {
    for (j = 0; j < dayRange; j++) {
      var containerEl = document.getElementById("container");
      if (storedTasks) {
        // Have to point to children[j+1] because <template> would be children[j]
        containerEl.children[j + 1].children[0].children[1].append(storedTasks[j])
      }
    };
  }

  // Set id to each section inside container and increments id#
  function setFormID () {
    resetHour();
    $('form').each(function () {
      const hourEl = new Date();
      hourEl.setHours(startHour);
      this.setAttribute("id", startHour);
      startHour++;
    });
  }

    // Adds unique IDs to each textarea element
    function setTextAreaID() {
      resetHour();
      $('textarea').each(function () {
        this.setAttribute("id", "hour-" + startHour);
        startHour++;
      });
    }

  // Append hour displays to rows
  function displayHours() {
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
  }

  // Add's timeblock class to each row
  function addTimeClass() {
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
  }

  // Listener for the save button
  function handleFormSubmit(event) {
    event.preventDefault();
    var btnClicked = $(event.target);
    // Grabs ID of form
    var sectionID = btnClicked.attr('id')
    // Use ID to create matching format string for textarea ID
    var nameBreakdown = "hour-" + sectionID;
    var descriptionInput = $('#' + nameBreakdown).val();
    // Clears currently stored taskarray from local storage
    localStorage.clear();
    // Clears current taskArray value
    taskArray = [];
    taskArray.length = dayRange;
    // Saves description input at specific index
    taskArray[sectionID - 9] = descriptionInput;

    // Stringify updated taskarray and save to local storage
    localStorage.setItem("current-tasks", JSON.stringify(taskArray))
  }

  // Calls all functions to set up hour row divs
  addTemplate();
  renderArray();
  setFormID();
  setTextAreaID();
  displayHours();
  addTimeClass();

  // Create a submit event listener on the form element
  container.on('submit', handleFormSubmit);
});