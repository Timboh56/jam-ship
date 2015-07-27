(function(App) {
  App.Recorder = function(opts) {
    'use strict';
    var self = this;
    self.recording = false;

    self.initializeRecorder = function(opts) {
      var instrument, recorderOpts, recOpts;

      recOpts = opts || {};

      if (recOpts['instrument'])
        instrument = recOpts['instrument'];
      else throw 'Please include an instrument to record';
      
      self.recorder = T('rec', (recOpts['recorderOpts'] || {}), instrument).on('ended', function(buffer) {
        T('buffer', {buffer:buffer, loop:true}).play();
      });    
    }

    self.toggleRecording = function(opts) {
      if (self.recording)
        self.stopRecording();
      else
        self.startRecording(opts);
    }

    self.startRecording = function(opts) {
      if (!self.recorder)
        self.initializeRecorder(opts);
      self.recording = true;
      self.recorder.start();
    }

    self.stopRecording = function() {
      self.recorder.stop();
      self.recording = false;
      self.playRecording();
    }

    self.playRecording = function() {
      self.recorder.stop().play();
    }
  }

  return App;
})(App || {});