Synth = function(opts) {
  "use strict";

  var parent, freqSlide, self, opts, notes;
  
  self = this,
    self.opts = opts || {},
    self.notes = {},
    self.freqs = {};

  self.wave = opts["wave"] || "sin";
  self.attack = null;
  self.release = null;

  self.generateSynthFromSettings = function (freq) {
    return T(self.wave, {freq: freq  * 1.01, mul: 0.05, phase: Math.PI * 0.25 });
  }

  self.addOscillator = function (opts) {

  }

  self.handleMidi = function(note, velocity) {
    var freq;
    if (self.notes[note]) {
      if (velocity > 0)
        self.play(note, velocity);
      else
        self.stop(note);
    } else {
      freq = Constants.FREQUENCIES[note];
      self.notes[freq] = self.generateSynthFromSettings(freq);
    }
  }

  self.play = function(note, velocity) {
    self.playNote(note, velocity);
    if (self.opts["onPlay"]) self.opts["onPlay"].call(this, note, velocity)
    self.parent.broadcast.call(this, note, velocity);
  }

  self.playNote = function(note, velocity) {
    self.notes[note].set({ velocity: velocity });
    self.notes[note].play();
  }

  self.stop = function(note) {
    self.stopNote(note)
    if (self.opts["onStop"]) self.opts["onStop"].call(this, note) 
    self.parent.broadcast.call(this, note, 0);
  }

  self.stopNote = function(note) {
    self.notes[note].set({ velocity: 0 });
    self.notes[note].pause();
  }

  self.setWave = function(wave) {
    self.wave = wave;
    initializeNoteBank();
  }

  self.opts["play"] = self.play;
  self.opts["stop"] = self.stop;

  if (!T) throw "Could not find Timbre JS. Did you include it?";
  freqSlide = 880;

  function initializeNoteBank() {
    for (var i in Constants.FREQUENCIES)
      self.notes[i] = self.generateSynthFromSettings(Constants.FREQUENCIES[i]);
  }

  function generateLead(freq) {
    return T("saw", {freq: freq, attack: 1});
  }

  parent = new Instrument(self);
  Synth.prototype = parent;
  self.parent = parent;
  initializeNoteBank();
}