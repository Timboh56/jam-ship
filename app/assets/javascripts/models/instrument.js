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

    self.saveBuffer = function(opts) {
      var dfd = $.Deferred(),
        fd = new FormData(),
        id = opts.id,
        blob = opts.blob,
        icon = App.Helpers.renderSpinner(),
        clipName = $('#clip-name-' + id).val();

      fd.append('fname', clipName + '.wav');
      fd.append('channel_id', self.channel_id);
      if (blob) fd.append('data', blob);

      $('#upload-clip-' + id).html(icon);

      $.ajax({
        type: 'POST',
        url: '/api/clips/',
        data: fd,
        processData: false,
        contentType: false,
        success: function(xhr) {
          var rowHtml = App.Helpers.renderTemplate('.alert-info-template', {
            message: 'Uploaded and saved!'
          });
          $('.flash-messages').html(rowHtml);
          dfd.resolve({ id: id });
        },
        error: function(xhr) {
          var rowHtml = App.Helpers.renderTemplate('.alert-danger-template', {
            message: 'Uploaded was not successful!'
          });
          $('.flash-messages').html(rowHtml);
          dfd.reject({ id: id });
        }
      });
      return dfd.promise();
    }

    self.deleteClip = function(id) {
      var dfd = $.Deferred();
      $('#delete-clip-' + id).html(App.Helpers.renderSpinner());

      $.ajax({
        type: 'DELETE',
        url: '/api/clips/' + id,
        data: { id: id },
        processData: false,
        contentType: false,
        success: function(xhr) {
          var rowHtml = App.Helpers.renderTemplate('.alert-info-template', {
            message: 'Successfully deleted!'
          });
          $('.flash-messages').html(rowHtml);
          dfd.resolve(xhr);
        },
        error: function(xhr) {
          var rowHtml = App.Helpers.renderTemplate('.alert-danger-template', {
            message: 'Could not delete this clip!'
          });
          $('.flash-messages').html(rowHtml);
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
    self.InstrumentCRUD = new App.InstrumentCRUD(opts);
    self.currentOctave = opts['currentOctave'] || 3;
    self.inputFieldsClass = opts['inputFieldsClass'];
    self.notes = {};
    self.noteInterval = 0; // milliseconds since last note
    self.velocity = App.Constants.DEFAULT_VELOCITY;

    function initialize() {
      self = App.Helpers.applyProperties(opts, self);

      window.RtcAdapter.set('onReceive', opts['onReceive']);

      self.MidiControl = new App.MidiControl({
        onMidiMessage: self.onMidiMessage
      });

      opts['broadcast'] = window.FirebaseInterface.broadcast;

      self.Sequencer = new App.Sequencer(opts);

      self = App.Helpers.applyProperties(self.Sequencer, self);

      self.InstrumentControl = new App.InstrumentControl({
        inputFieldsClass: opts['inputFieldsClass'],
        onKeyDown: opts['onKeyDown'],
        onKeyUp: opts['onKeyUp'],
        onKeyPress: opts['onKeyPress'],
        onChangeInput: opts['onChangeInput']
      });
    }

    self.enableKeyboard = function() {
      self.InstrumentControl.enable();
    }

    self.disableKeyboard = function() {
      self.InstrumentControl.disable();
    }

    self.broadcast = function(opts) {
      opts = $.extend({}, opts, { channel: self.channel });
       window.FirebaseInterface.broadcast(opts);
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

    initialize();

  }

  return App;
})(App);