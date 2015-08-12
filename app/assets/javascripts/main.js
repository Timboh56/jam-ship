window.myDataRef = new Firebase('https://jam-ship.firebaseio.com/');

window.initialize = function(channel, clips) {
  var synth = new App.Synth({
    channel: channel,
    clips: clips,
    onCreateBuffer: function (id) {
      var rowHtml = $('.record-row-template').html(),
        recordTrackCount = $('.recording-track').length + 1,
        opts = {
          'id' : id,
          'count' : recordTrackCount
        };

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
      if (synth.mode == 'live') synth.broadcast({ note: note, velocity: velocity });
    },

    onStop: function(note) {
      note = note.replace('#', 'sharp');
      $("#" + note).removeClass('active');
      if (synth.mode == 'live') synth.broadcast({ note: note, velocity: 0 });
    },

    onPlayRecording: function(val) {
      //if (synth.mode == 'live') synth.broadcast({ buffer: stringify(val) });
    },

    onStopRecording: function(val) {
      var secs = parseInt(val/1000);
      $('#synth-recording-time-input').val(secs);
      $('#synth-recording-time-input').attr('value', secs).knob();
    },
    inputFieldsClass: 'synth-field'
  });

  $(document).on('click', '.js-record-action', function(el) {
    var self = $(this),
      recordId = self.data('record-id'),
      action = self.data('action');

      if (action == 'startRecording' || action == 'stopRecording') {
        synth.Recorder[action].call(this, {
          recordId: recordId,
          instrument: synth.getCurrentInstrument()
        });
      } else {
        synth.Recorder[action].call(this, recordId);
      }
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
      stepData = parseFloat(self.data('step')),
      step = stepData || (max < 1.01 ? 0.01 : 0.5);

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
};