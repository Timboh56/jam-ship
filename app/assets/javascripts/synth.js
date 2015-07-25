Synth = function(opts) {
  "use strict";

  var parent, freqSlide, self, opts, notes;
  
  self = this;
  self.opts = opts || {},
  self.notes = {},
  self.freqs = {};
  self.mode = "organ" // or "envelope"
  self.inputFieldsClass = opts['inputFieldsClass'];
  self.notes = {};

  self.handleMidi = function(note, velocity) {
    if (velocity > 0)
      self.play(note, velocity);
    else
      self.stop(note);
  }

  self.play = function(note, velocity) {
    self.playNote(note, velocity);
    if (self.opts["onPlay"]) self.opts["onPlay"].call(this, note, velocity)
    self.parent.broadcast.call(this, note, velocity);
  }

  self.playNote = function(note, velocity) {
    var freq = Constants.FREQUENCIES[note];
    if (self.mode == 'organ')
      self.notes[note].play();
    else
      self.synth.noteOnWithFreq(freq, velocity);
  }

  self.stop = function(note) {
    self.stopNote(note);
    if (self.opts["onStop"]) self.opts["onStop"].call(this, note) 
    self.parent.broadcast.call(this, note, 0);
  }

  self.stopNote = function(note) {
    if (self.mode == 'organ')
      self.notes[note].pause();
    else
      self.synth.noteOff();
  }

  self.setDecay = function(decay) {
    self.decay = parseFloat(decay) || Constants.DEFAULT_DECAY;
    generateSynthFromSettings();
  }

  self.setAttack = function(attack) {
    self.attack = parseFloat(attack) || Constants.DEFAULT_ATTACK;
    generateSynthFromSettings();
  }

  self.setWave = function(wave) {
    self.wave = Constants.WAVES.indexOf(wave) != -1 ? wave : Constants.DEFAULT_WAVE;
    generateSynthFromSettings();
  }

  self.setSustain = function(sustain) {
    self.sustain = parseFloat(sustain) || Constants.DEFAULT_SUSTAIN;
    generateSynthFromSettings();
  }

  self.setVolume = function(mul) {
    self.mul = parseFloat(mul);
    generateSynthFromSettings();
  }

  self.setMode = function(mode) {
    self.mode = mode;
    generateSynthFromSettings();
  }

  self.opts["play"] = self.play;
  self.opts["stop"] = self.stop;

  if (!T) throw "Could not find Timbre JS. Did you include it?";
  freqSlide = 880;

  function generateSynthFromSettings() {
    var env, osc;
    env = generateAdsr(self.attack, self.decay, self.sustain, self.release);

    if (self.mode == 'organ')
      initializeNoteBank();
    else
      self.synth = T('OscGen', { osc: T(self.wave), env: env, mul: self.mul }).play();
  }

  function generateOsc(freq) {
    return T(self.wave, {freq: freq  * 1.01, mul: 0.05, phase: Math.PI * 0.25 });
  }

  function generateEnv(attack, decay, sustain, release) {
    return T("perc", {d: decay, a: attack, r: release});
  }

  function generateAdsr(attack, decay, sustain, release) {
    var env = T("adshr", { a: attack, d:decay, s: sustain,r: release}, T(self.wave)).on("ended", function() {
      this.pause();
    }).bang();
    return env;
  }

  function initialize() {
    var opts = ['wave', 'attack', 'release', 'decay', 'mul'];
    for (var field in opts)
      self[opts[field]] = Constants['DEFAULT_' + field.toUpperCase()];
    generateSynthFromSettings();
    self.parent = new Instrument(self);
  }

  function initializeNoteBank() {
    for (var i in Constants.FREQUENCIES)
      self.notes[i] = generateOsc(Constants.FREQUENCIES[i]);
  }

  initialize();
  initializeNoteBank();
}