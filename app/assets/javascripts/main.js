var myDataRef = new Firebase('https://pftxxze6h6m.firebaseio-demo.com/');

var synth = new Synth({
  onPlay: function(note) {
    window.document.body.style.backgroundColor = Constants.COLORS[note];
  }
});

$('#messageInput').keypress(function (e) {
  if (e.keyCode == 13) {
    var name = $('#nameInput').val();
    var text = $('#messageInput').val();
    myDataRef.set('User ' + name + ' says ' + text);
    console.log("OK");
    myDataRef.push({name: name, text: text});
    $('#messageInput').val('');
  }
});

myDataRef.on('child_added', function(snapshot) {
  //We'll fill this in later.
});

function displayChatMessage(name, text) {
  $('<div/>').text(text).prepend($('<em/>').text(name+': ')).appendTo($('#messagesDiv'));
  $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
};