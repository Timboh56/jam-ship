(function(App) {
  var self;
  App.Synth = function(opts) {
    var parent, freqSlide, self, opts, notes;

    self = App.Synth.prototype = new App.Instrument({
      inputFieldsClass: opts['inputFieldsClass'],
      onKeyDown: (function(event) {
        var keyPressed, note, velocity;
        keyPressed = getChar(event);
        if (self.InstrumentControl.keyboardOn && self.mode == "playing") {
          self.InstrumentControl.prevKey = keyPressed;

        if (self.play && App.Constants.KEYTONOTE[keyPressed]) {
          note = self.noteLookUp(keyPressed);
          self.play(note, self.velocity);
         }
        }
      }).bind(this),

      onKeyUp: (function(event) {
        var keyPressed, note, velocity;
        if (self.InstrumentControl.keyboardOn && self.mode == "playing") {
          keyPressed = getChar(event);
          if (self.stop && App.Constants.KEYTONOTE[keyPressed]) {
            note = self.noteLookUp(keyPressed);
            self.stop(note);
          }
        }
      }).bind(this),

      onKeyPress: (function(event) {
        var keyPressed = getChar(event);

        if (self.currentOctave > 1 && keyPressed == "Z")
          self.currentOctave -= 1;
        if (self.currentOctave < 4 && keyPressed == "X")
          self.currentOctave += 1;
        if (keyPressed == 'R')
          self.toggleRecording();
      }).bind(this),

      onChangeInput: (function(event) {
        var synthField,  val;
        synthField = capitalizeFirstLetter($(event.currentTarget).data('synth-field'));
        val = $(event.currentTarget).val();
        if (synthField == 'Volume' && (val < 0 || val > 0.99)) 
          $(event.currentTarget).val(App.Constants.DEFAULT_MUL);

        self['set' + synthField]($(event.currentTarget).val());

      }).bind(this)
    });

    self.opts = opts || {},
    self.notes = {},
    self.freqs = {};
    self.synthMode = "organ" // or "envelope"
    self.inputFieldsClass = opts['inputFieldsClass'];
    self.wave = opts['wave'] || App.Constants.DEFAULT_WAVE;
    self.opts["play"] = self.play;
    self.opts["stop"] = self.stop;

    if (!T) throw "Could not find Timbre JS. Did you include it?";
    freqSlide = 880;

    self.generateOsc = function(freq) {
      return T(self.wave, {freq: freq  * 1.01, mul: 0.05, phase: Math.PI * 0.25 });
    }

    self.generateEnv = function(attack, decay, sustain, release) {
      return T("perc", {d: decay, a: attack, r: release});
    }

    self.generateAdsr = function(attack, decay, sustain, release) {
      var env = T("adshr", { a: attack, d:decay, s: sustain,r: release}, T(self.wave)).on("ended", function() {
        this.pause();
      }).bang();
      return env;
    }

    self.generateSynthFromSettings = function(opts) {
      var env, osc, wave, opts, attack, decay, sustain, release;
      opts = opts || {};
      attack = opts['attack'] || self.attack;
      decay = opts['decay'] || self.decay;
      sustain = opts['sustain'] || self.sustain;
      release = opts['release'] || self.release;
      wave = opts['wave'] || self.wave;

      env = self.generateAdsr(attack, decay, sustain, release);
      
      if (self.synthMode == 'organ')
        self.initializeNoteBank();
      else
        self.synth = T('OscGen', { osc: T(wave), env: env, poly: true, mul: self.mul }).play();
    }

    self.initialize = function() {
      var dfd = $.Deferred();
      var opts = ['wave', 'attack', 'release', 'decay', 'mul'];
      for (var field in opts)
        self[opts[field]] = App.Constants['DEFAULT_' + opts[field].toUpperCase()];

      self.generateSynthFromSettings();

      dfd.resolve();
      return dfd.promise();
    }

    self.initializeNoteBank = function() {
      for (var i in App.Constants.FREQUENCIES) {
        self.notes[i] = T(self.wave, {freq: App.Constants.FREQUENCIES[i] * 1.01, mul: 0.05, phase: Math.PI * 0.25 });
        self.notes[i].noteInterval = 0;
        self.notes[i].startTime = null;
      }
    }

    self.handleMidi = function(note, velocity) {
      if (velocity > 0 && self.mode == 'playing')
        self.play(note, velocity);
      else
        self.stop(note);
    }

    self.play = function(note, velocity) {
      var noteInterval;
      if (self.opts["onPlay"]) self.opts["onPlay"].call(this, note, velocity);
      noteInterval = self.notes[note].noteInterval = self.elapsedSinceLastNote(self.notes[note].startTime)
      self.playNote.apply(this, [note, velocity, noteInterval]);
      self.notes[note].startTime = self.startNoteInterval(note);
      self.broadcast.apply(this, [note, velocity, noteInterval]);
    }

    self.playNote = function(note, velocity, noteInterval) {
      var freq = App.Constants.FREQUENCIES[note];
      if (noteInterval) {
        setTimeout(self.playIndividualNote.apply(this, [note, freq, velocity]), noteInterval);
      }
      if (self.synthMode == 'organ')
        self.notes[note].play();
      else
        self.synth.noteOnWithFreq(freq, velocity);
    }

    self.playIndividualNote = function(note, freq, velocity) {
      if (self.synthMode == 'organ')
        self.notes[note].play();
      else
        self.synth.noteOnWithFreq(freq, velocity);
    }

    self.stop = function(note) {
      var noteInterval;
      self.stopNote(note);
      if (self.opts["onStop"]) self.opts["onStop"].call(this, note);
      noteInterval = self.elapsedSinceLastNote(note);
      self.broadcast.call(this, note, 0);
    }

    self.stopNote = function(note) {
      if (self.synthMode == 'organ')
        self.notes[note].pause();
      else
        self.synth.noteOff();
    }

    self.setDecay = function(decay) {
      self.decay = parseFloat(decay) || App.Constants.DEFAULT_DECAY;
      self.generateSynthFromSettings();
    }

    self.setAttack = function(attack) {
      self.attack = parseFloat(attack) || App.Constants.DEFAULT_ATTACK;
      self.generateSynthFromSettings();
    }

    self.setWave = function(wave) {
      self.wave = App.Constants.WAVES.indexOf(wave) != -1 ? wave : App.Constants.DEFAULT_WAVE;
      self.generateSynthFromSettings();
    }

    self.setSustain = function(sustain) {
      self.sustain = parseFloat(sustain) || App.Constants.DEFAULT_SUSTAIN;
      self.generateSynthFromSettings();
    }

    self.setVolume = function(mul) {
      self.mul = parseFloat(mul);
      self.generateSynthFromSettings();
    }

    self.setSynthMode = function(synthMode) {
      self.synthMode = synthMode;
      self.generateSynthFromSettings();
    }

    self.setMode = function(mode) {
      self.mode = mode;
      self.generateSynthFromSettings();
      self.InstrumentControl.attachKeyHandlers(mode);
    }

    self.initializeNoteBank();
    self.initialize();
    return self;
  }
  self = App.Synth.prototype;

  return App;
})(App);