window.myDataRef = new Firebase('https://jam-ship.firebaseio.com/');

var synth = new App.Synth({
  onPlay: function(note, velocity) {
    note = note.replace('#', 'sharp');
    $("#" + note).addClass('active');
  },
  onStop: function(note) {
    note = note.replace('#', 'sharp');
    $("#" + note).removeClass('active');
  },
  inputFieldsClass: 'synth-field'
});

$(document).on('keypress', '#messageInput', function (e) {
  if (e.keyCode == 13) {
    var name = $('#nameInput').val();
    var text = $('#messageInput').val();
    myDataRef.push({name: name, text: text});
    $('#messageInput').val('');
  }
});


function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
function displayChatMessage(name, text) {
  $('<div/>').text(text).prepend($('<em/>').text(name+': ')).appendTo($('#messagesDiv'));
  $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
};

function getChar(event) {
  return String.fromCharCode(event.keyCode || event.charCode).toUpperCase();
}