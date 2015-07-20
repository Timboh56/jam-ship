Synth = function(opts) {
  "use strict";
  var freqSlide, self, opts, notes;
  
  self = this,
    self.opts = opts || {},
    self.notes = {},
    self.freqs = {};

  self.attack = null;
  self.release = null;

  self.generateSynthFromSettings = function (freq) {
    return  T(
        generateLead(freq),
        T("sin", {freq: freq  * 1.01, mul: 0.05, phase: Math.PI * 0.25 })
      );
  }

  self.handleMidi = function(note, velocity) {
    var freq;
    if (self.notes[note]) {
      if (velocity > 0)
        self.playFunction(note, velocity);
      else
        self.stopFunction(note);
    } else {
      freq = Constants.FREQUENCIES[note];
      self.notes[freq] = self.generateSynthFromSettings(freq);
    }
  }

  self.playFunction = function(freq, velocity) {
    self.notes[freq].play();
    if (self.opts["onPlay"]) self.opts["onPlay"].call(this, freq)
  }

  self.stopFunction = function(freq) {
    self.notes[freq].pause();
    if (self.opts["onStop"]) self.opts["onStop"].call(this, freq) 
  }

  self.opts["playFunction"] = self.playFunction;
  self.opts["stopFunction"] = self.stopFunction;

  if (!T) throw "Could not find Timbre JS. Did you include it?";
  freqSlide = 880;

  function initializeNoteBank() {
    for (var i in Constants.FREQUENCIES)
      self.notes[i] = self.generateSynthFromSettings(Constants.FREQUENCIES[i]);
  }

  function generateLead(freq) {
    return T("saw", {freq: freq});
  }

  function generateMoog() {
    var lead = generateLead();
    return T("MoogFF", {freq:2400, gain:6, mul:0.1}, lead);
  }

  function generateEnv() {
    return T("perc", {r:100});
  }

  function generateArp() {
    var env = generateEnv();
    return T("OscGen", {wave:"sin(15)", env:env, mul:0.5});
  }

  Synth.prototype = new Instrument(self);

  initializeNoteBank();
}