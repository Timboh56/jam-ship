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

$(function(){
  $('.knob').each(function(index, el) {
    var self = $(el),
      id = self.attr('id'),
      min = parseFloat(self.data('min')),
      max = parseFloat(self.data('max')),
      dataType = self.data('type'),
      step = max < 1.01 ? 0.01 : 0.1;

    $('#' + id).knob({
      min: min,
      max: max,
      step: step
    });
  });
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