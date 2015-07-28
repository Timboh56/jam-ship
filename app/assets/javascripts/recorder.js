(function(App) {
  App.Recorder = function(opts) {
    'use strict';
    var self = this;
    self.recording = false;
    self.recorder = null;
    self.recordingTime = 60000;
    self.currentRecordId = null;
    self.buffers = {};
    self.tempBuffer = [];
    self.broadcast = opts['broadcast'];
    self.onCreateBuffer = opts['onCreateBuffer'];
    self.onDeleteBuffer = opts['onDeleteBuffer'];
    self.initializeRecorder = function(opts) {
      var dfd, instrument, recorderOpts, recOpts, tempBuffer;
      self.tempBuffer = []
      dfd = $.Deferred();
      recOpts = opts || {};

      if (recOpts['instrument'])
        instrument = recOpts['instrument'];
      else throw 'Please include an instrument to record';

      self.recorder = T('rec', { timeout: self.recordingTime || recOpts['recordingTime']}, instrument).on('ended', (function(buffer) {
        var t = T('buffer', {buffer: buffer, loop:true});
        t.buffer = buffer;
        self.tempBuffer.push(t);
        self.recording = false;
        dfd.resolve();
      }).bind(this));

      return dfd.promise();
    }

    self.toggleRecording = function(opts) {
      if (self.recording)
        self.stopRecording();
      else
        self.startRecording(opts);
    }

    self.startRecording = function(opts) {
      var timestamp, recorder;
      timestamp = new Date().getUTCMilliseconds();
      
      self.currentRecordId = timestamp;

      // record from previous created track??????
      if (opts['recordId'])
        self.recorder = recorder = self.buffers[opts['recordId']];
      else {
        recorder = self.initializeRecorder(opts).then((function() {
          self.buffers[timestamp] = self.tempBuffer;
          self.onCreateBuffer.call(this, timestamp);
          $('.recording-status-text').html('');
          $('.record-btn').removeClass('hide');
          $('.stop-btn').addClass('hide');
          self.play(timestamp);
          //self.broadcast.apply(this, [ { buffer: self.buffers[self.currentRecordId].buffer }]);
        }).bind(this));
      }

      $('.recording-status-text').html('recording..');
      $('.record-btn').addClass('hide');
      $('.stop-btn').removeClass('hide');
      self.recording = true;
      self.recorder.start();
    }

    self.stop = function(recordId) {
      var arr = self.buffers[recordId];
      for (var i = 0; i < arr.length; i++) arr[i].pause();
    }

    self.deleteBuffer = function(recordId) {
      self.stop(recordId);
      delete self.buffers[recordId];
      self.onDeleteBuffer.call(this, recordId);
    }

    self.play = function(recordId) {
      var arr = self.buffers[recordId];
      for (var i = 0; i < arr.length; i++) arr[i].play();
    }

    self.stopRecording = function(opts) {
      self.recorder.stop();
      self.recording = false;
    }

    self.setBPM = function(bpm, bpl) {
      self.BPM = bpm;
      self.recordingTime = self.calculateRecordingTime(bpm, bpl)
    }

    self.setBPL = function(bpm, bpl) {
      self.BPL = bpl;
      self.recordingTime = self.calculateBPM(self.BPM, bpl)
    }

    // convert BPM into recording Time in milliseconds
    self.calculateBPM = function(recordingTime, bpl) {
      return 60000/recordingTime;
    }

    // convert BPM into recording Time in milliseconds
    self.calculateRecordingTime = function(bpm, bpl) {
      var beatsPerLoop, loopsPerMinute;
      beatsPerLoop = bpl || 4;
      loopsPerMinute = (bpm / bpl);
      return 60000/loopsPerMinute;
    }
  }

  return App;
})(App || {});