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
      taskArray.length = dayRange;
      var containerEl = document.getElementById("container");
      // If stored tasks exists...
      if (storedTasks) {
        // if stored task at index j is blank then return ""
        if (storedTasks[j] === null) {
          containerEl.children[j + 1].children[0].children[1].append("")
        } else {
          // if stored task at index j is not blank, add to rendered array
          // Have to point to children[j+1] because <template> would be children[j]
          containerEl.children[j + 1].children[0].children[1].append(storedTasks[j])
        }
      };
    };
  }

  // Set id to each section inside container and increments id#
  function setFormID() {
    resetHour();
    $('form').each(function () {
      var hourDisplayed = dayjs().hour(startHour);
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
      var hourDisplayed = dayjs().hour(startHour)
      this.append(hourDisplayed.format('hA'))
      startHour++;
    });
  }

  // Add's timeblock class to each row
  function addTimeClass() {
    resetHour();
    $('section').each(function () {
      var hourDisplayed = dayjs().hour(startHour);
      var rightNow = dayjs();
      // Compare display hour to currentHour and add class appropriately
      if (hourDisplayed < rightNow) {
        this.classList.add('past');
      } else if (hourDisplayed > rightNow) {
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