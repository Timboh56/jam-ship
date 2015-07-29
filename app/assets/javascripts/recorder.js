String.prototype.toUnderscore = function(){
  return this.replace(/([A-Z])/g, function($1){return "_"+$1.toLowerCase();});
};

(function(App) {
  App.Recorder = function(opts) {
    'use strict';
    var self = this;
    self.recording = false;
    self.recorder = null;
    self.recordingTime = 32000;
    self.metronomeOn = false;
    self.metronomeObj = null;
    self.currentRecordId = null;
    self.buffers = {};
    self.tempBuffer = [];
    self.onStopRecording = opts['onStopRecording'];

    $(['bpl', 'bpm', 'metronomeVel', 'metronomeFreq']).each((function(index, el) {
      var constantKey = el.toUnderscore().toUpperCase();
      self[el] = App.Constants['DEFAULT_' + constantKey];
    }).bind(this));


    self.broadcast = opts['broadcast'];
    self.onCreateBuffer = opts['onCreateBuffer'];
    self.onDeleteBuffer = opts['onDeleteBuffer'];

    self.playMetronomeTick = function () {
      var osc = T("sin"),
        env = T("perc", {a:10, r:5}),
        oscenv = T("OscGen", {osc:osc, env:env, mul: 0.15}).play();

      oscenv.play();
      oscenv.noteOnWithFreq(600, self.metronomeVel);
    }

    self.toggleMetronome = function() {
      self.metronomeOn = !self.metronomeOn;
      var interval, beat;
      beat = 1

      if (self.metronomeOn) {
        var beatLength = 60000/self.bpm;
        self.metronomeObj = T("interval", {interval: beatLength}, (function(count) {
          self.playMetronomeTick();
          $('.record-time').html(beat);
          if (beat % self.bpl === 0) beat = 1;
          else beat = beat + 1;
        }).bind(this));
        self.metronomeObj.start();
      } else
        self.metronomeObj.stop();
    }

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
      self.startTime = self.getNow();
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

    self.getNow = function() {
      return new Date().getTime();
    }

    self.elapsedSince = function(startTime) {
      return self.getNow() - (startTime || self.startTime);
    }

    self.stopRecording = function(opts) {
      self.recorder.stop();
      var now = new Date();
      //self.recordingTime = self.elapsedSince();
      //self.onStopRecording.call(this, self.recordingTime);
      self.recording = false;
    }

    self.setRecordingTime = function(recordingTime) {
      self.recordingTime = recordingTime;
    }

    self.setMetronomeVel = function(velocity) {
      self.metronomeVel = velocity;
    }

    self.setBpm = function(bpm, bpl) {
      self.bpm = bpm;
      self.recordingTime = self.calculateRecordingTime(bpm, bpl)
    }

    self.setBpl = function(bpl) {
      self.bpl = bpl;
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