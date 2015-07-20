window.myDataRef = new Firebase('https://jam-ship.firebaseio.com/');

var synth = new Synth({
  onPlay: function(note, velocity) {
    window.myDataRef.push({ note: note, velocity: velocity });
    note = note.replace('#', 'sharp');
    $("#" + note).addClass('active');
  },
  onStop: function(note) {
    window.myDataRef.push({ note: note, velocity: 0 });
    note = note.replace('#', 'sharp');
    $("#" + note).removeClass('active');
  }
});

$(document).on('change','#wave-selector', function (e) {
  var wave = $('#wave-selector').val();
  synth.setWave(wave);
});

$(document).on('keypress', '#messageInput', function (e) {
  if (e.keyCode == 13) {
    var name = $('#nameInput').val();
    var text = $('#messageInput').val();
    myDataRef.push({name: name, text: text});
    $('#messageInput').val('');
  }
});

myDataRef.on('child_added', function(snapshot) {
  var val = snapshot.val();
  if(val.velocity == 0)
    synth.stopNote(val.note);
  else
    synth.playNote(val.note, val.velocity);
});

function displayChatMessage(name, text) {
  $('<div/>').text(text).prepend($('<em/>').text(name+': ')).appendTo($('#messagesDiv'));
  $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
};