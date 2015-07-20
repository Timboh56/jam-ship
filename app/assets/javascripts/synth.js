Synth = function(opts) {
  "use strict";
  var freqSlide, self, opts, notes;
  
  self = this,
    self.opts = opts || {},
    self.notes = {};

  self.attack = null;
  self.release = null;

  self.playFunction = function(note, velocity) {
    self.notes[note].play();
    if (self.opts["onPlay"]) self.opts["onPlay"].call(note)
  }

  self.stopFunction = function(note, velocity) {
    self.notes[note].pause();
  }

  self.opts["playFunction"] = self.playFunction;
  self.opts["stopFunction"] = self.stopFunction;

  Synth.prototype = new Instrument(self.opts);

  if (!T) throw "Could not find Timbre JS. Did you include it?";
  freqSlide = 880;

  function initializeNoteBank() {
    for (var i in Constants.FREQUENCIES) {
      self.notes[i] = T(
        T("sin", {freq: Constants.FREQUENCIES[i], mul: 0.25 }),
        T("sin", {freq: Constants.FREQUENCIES[i]  * 1.01, mul: 0.05, phase: Math.PI * 0.25 })
      );
    }
  }

  initializeNoteBank();
}