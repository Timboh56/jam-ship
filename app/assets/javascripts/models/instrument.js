window.AudioContext = window.AudioContext || window.webkitAudioContext;
try {
  audioContext = new AudioContext();
} catch(e) {
  alert('The Web Audio API is apparently not supported in this browser.');
}

(function(App) {
  "use strict";

  App.InstrumentCRUD = function(opts) {
    var self = App.InstrumentCRUD.prototype;
    self.channel_id = opts['channel'];
    var supports_html5_storage = function () {
      try {
        return 'localStorage' in window && window['localStorage'] !== null;
      } catch (e) {
        return false;
      }
    }
    var updateLocalData = function(data){
      if(supports_html5_storage())
        localStorage.setItem('shape', JSON.stringify(data));
    }

    self.saveBuffer = function(blob) {
      var dfd = $.Deferred();
      var fd = new FormData();
      fd.append('fname', 'test.wav');
      fd.append('channel_id', self.channel_id);
      fd.append('data', blob);
      $.ajax({
        type: 'POST',
        url: '/api/clips/',
        data: fd,
        processData: false,
        contentType: false,
        success: function(xhr) {
          var successFlashDiv = $('.alert-info').html('Uploaded and saved.').clone();
          $('.flash-messages').html(successFlashDiv);
          dfd.resolve(xhr);
        },
        error: function(xhr) {
          var errorFlashDiv = $('.alert-danger').html('Upload was not successful.').clone();
          $('.flash-messages').html(errorFlashDiv);  
          dfd.reject();
        }
      });
      return dfd.promise();
    }

    self.deleteClip = function(id) {
      var dfd = $.Deferred();
      $.ajax({
        type: 'DELETE',
        url: '/api/clips/' + id,
        data: { id: id },
        processData: false,
        contentType: false,
        success: function(xhr) {
          var successFlashDiv = $('.alert-info').html('Successfully deleted.').clone();
          $('.flash-messages').html(successFlashDiv);
          dfd.resolve(xhr);
        },
        error: function(xhr) {
          var errorFlashDiv = $('.alert-danger').html('Upload was not successful.').clone();
          $('.flash-messages').html(errorFlashDiv);  
          dfd.reject();
        }
      });
      return dfd.promise();
    }

    return self;
  };

  /**
    * Instrument take in opts
    *   opts: { 
    *     playFunction: play()
    *   }
    */

  App.Instrument = function(opts) {
    var self = App.Instrument.prototype;
    self.mode = opts['mode'] || 'live';
    self.InstrumentCRUD = new App.InstrumentCRUD(opts);
    self.currentOctave = opts['currentOctave'] || 3;
    self.inputFieldsClass = opts['inputFieldsClass'];
    self.notes = {};
    self.noteInterval = 0; // milliseconds since last note
    self.velocity = App.Constants.DEFAULT_VELOCITY;
    for (var prop in opts) self[prop] = self[prop] || opts[prop];

    self.firebaseInterface = FirebaseAdapter(opts);

    self.MidiControl = new App.MidiControl({
      onMidiMessage: self.onMidiMessage
    });

    opts['broadcast'] = self.firebaseInterface.broadcast;

    self.Recorder = new App.Recorder(opts);

    self.InstrumentControl = new App.InstrumentControl({
      inputFieldsClass: opts['inputFieldsClass'],
      onKeyDown: opts['onKeyDown'],
      onKeyUp: opts['onKeyUp'],
      onKeyPress: opts['onKeyPress'],
      onChangeInput: opts['onChangeInput']
    });

    self.broadcast = function(opts) {
      opts = $.extend({}, opts, { channel: self.channel });
       self.firebaseInterface.broadcast(opts);
    };

    self.toggleRecording = function() {
      //if (self)
    }

    self.noteLookUp = function(key) {
      var octave = this.currentOctave || 3;

      if (['K', 'O', 'L', 'P'].indexOf(key) != -1)
        octave += 1;

      return App.Constants.KEYTONOTE[key] + octave;
    }
  }

  return App;
})(App);