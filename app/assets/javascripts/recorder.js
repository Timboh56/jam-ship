(function(App) {
  App.Recorder = function(opts) {
    'use strict';
    var self = this;
    self.recording = false;
    self.recorder = null;
    self.recordingTime = 3000;

    self.initializeRecorder = function(opts) {
      var instrument, recorderOpts, recOpts;

      recOpts = opts || {};

      if (recOpts['instrument'])
        instrument = recOpts['instrument'];
      else throw 'Please include an instrument to record';
      
      /**self.recorder = timbre.rec(function(output) {

        var gen = T("PluckGen", {env:T("adsr", {r:100})});
        var mml = "o3 l8 d0grf0b-rg0<c4.> d0grf0b-ra-0<d->g0<c2> d0grf0b-rg0<c4.>f0b-rd0g2..";

        T("mml", {mml:mml}, gen).on("ended", function() {
          output.done();
        }).start();

        var synth = gen;
        synth = T("dist" , {pre:60, post:-12}, synth);
        synth = T("delay", {fb :0.5, mix:0.2}, synth);

        output.send(synth);

      }).then(function(buffer) {

        T("buffer", {buffer:buffer, loop:true, reverse:true}).play();

      });**/

      self.recorder = T('rec', { timeout: recOpts['recordingTime'] || self.recordingTime }, instrument).on('ended', function(buffer) {
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
      //self.recorder.stop();
      self.recorder.done();
      self.recording = false;
      self.playRecording();
    }

    self.playRecording = function() {
      self.recorder.then(function(buffer) {
        T("buffer", {buffer:buffer, loop:true, reverse:true}).play();
      });
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