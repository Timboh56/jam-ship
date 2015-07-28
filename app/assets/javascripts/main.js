window.myDataRef = new Firebase('https://jam-ship.firebaseio.com/');

$(document).ready(function() {
  var synth = new App.Synth({
    onCreateBuffer: function (id) {
      // add jqery row
      var opts = { 'id' : id},
        rowHtml = $('.record-row-template').html();
      for (var prop in opts){
        var pattern = '{{\\s*' + prop + '\\s*}}';
        rowHtml = rowHtml.replace(new RegExp(pattern, 'g'), opts[prop]);
      }

      $('.recordings-container').append(rowHtml);
    },
    onDeleteBuffer: function(id) {
      $('#recording-track-container-' + id).remove();
    },
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

  $(document).on('click', '.js-record-action', function(el) {
    var self = $(this),
      recordId = self.data('record-id'),
      action = self.data('action');
    synth.Recorder[action].apply(this, [recordId])
  });

  $(document).on('keypress', '#messageInput', function (e) {
    if (e.keyCode == 13) {
      var name = $('#nameInput').val();
      var text = $('#messageInput').val();
      myDataRef.push({name: name, text: text});
      $('#messageInput').val('');
    }
  });

  $('.knob').each(function(index, el) {
    var self = $(el),
      id = self.attr('id'),
      min = parseFloat(self.data('min')),
      max = parseFloat(self.data('max')),
      dataType = self.data('type'),
      step = max < 1.01 ? 0.01 : 0.5;

    $('#' + id).knob({
      min: min,
      max: max,
      step: step,
      width: 60,
      height: 60,
      fontWeight: 'bold',
      fontFamily: 'Roboto',
      fgColor: '#222222',
      thickness: 0.4,
      release: function(e, v) {
        synth.InstrumentControl.onChangeInput($('#' + id));
      }
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