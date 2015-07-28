(function(App) {
  var self;
  App.Synth = function(opts) {
    var parent, freqSlide, self, opts, notes, onChangeInput;

    self = App.Synth.prototype = new App.Instrument({
      onDeleteBuffer: opts['onDeleteBuffer'],
      onCreateBuffer: opts['onCreateBuffer'],
      onMidiMessage: opts['onMidiMessage'] || function(note, velocity) {
        if (velocity > 0 && self.mode == 'playing')
          self.play(note, velocity);
        else
          self.stop(note);
      },
      inputFieldsClass: opts['inputFieldsClass'],

      onKeyDown: (function(event) {
        var keyPressed, note, velocity;
        keyPressed = getChar(event);
        note = self.noteLookUp.apply(self, [keyPressed]);
        if (self.InstrumentControl.keyboardOn && "playing" == self.mode) {
          if (App.Constants.KEYTONOTE[keyPressed] && !self.notes[note].keyDown) {
            self.notes[note].keyDown = true;
            self.play(note, self.velocity);
          }
        }
      }).bind(this),

      onKeyUp: (function(event) {
        var keyPressed, note, velocity;

        keyPressed = getChar(event);
        note = self.noteLookUp.apply(self, [keyPressed]);
        if (self.InstrumentControl.keyboardOn && "playing" == self.mode) {
          if (App.Constants.KEYTONOTE[keyPressed] && self.notes[note].keyDown) {
            self.notes[note].keyDown = false;
            self.stop(note);
          }
        }
      }).bind(this),

      onKeyPress: (function(event) {
        var keyPressed, instrument;
        keyPressed = getChar(event);
        if (self.currentOctave > 1 && keyPressed == "Z")
          self.decrementCurrentOctave()
        if (self.currentOctave < 5 && keyPressed == "X")
          self.incrementCurrentOctave()
        if (keyPressed == 'R') {
          instrument = self.synth;
          self.Recorder.toggleRecording({
            instrument: instrument
          });
        }
      }).bind(this),

      onChangeInput: (function(el) {
        var target = (el.val ? el : $(el.currentTarget)),
          val = (parseFloat(target.val()) ?parseFloat(target.val()) : target.val()),
          dataType = target.data('type'),
          max = parseFloat(target.data('max')),
          id = target.attr('id'),
          synthField = capitalizeFirstLetter(target.data('synth-field'));

        if (dataType == 'seconds')
          val = parseFloat(val) * 1000;
        if (synthField == 'Volume' && (parseFloat(val) < 0 || parseFloat(val) > 0.99)) 
          $('#' + id).val(App.Constants.DEFAULT_MUL);

        self['set' + synthField](val);
      }).bind(this)
    });

    self.opts = opts || {},
    self.notes = {},
    self.freqs = {};
    self.synthMode = "envelope" // or "envelope"
    self.inputFieldsClass = opts['inputFieldsClass'];
    self.wave = opts['wave'] || App.Constants.DEFAULT_WAVE;
    self.opts["play"] = self.play;
    self.opts["stop"] = self.stop;

    if (!T) throw "Could not find Timbre JS. Did you include it?";
    freqSlide = 880;

    self.incrementCurrentOctave = function() {
      self.currentOctave = self.currentOctave + 1;
      self.generateSynthFromSettings();
    }

    self.decrementCurrentOctave = function() {
      self.currentOctave = self.currentOctave - 1;
      self.generateSynthFromSettings();
    }

    self.generateOsc = function(freq) {
      return T(self.wave, {freq: freq  * 1.01, mul: 0.05, phase: Math.PI * 0.25 });
    }

    self.generateEnv = function(attack, decay, sustain, release) {
      return T("perc", {sustained: true, d: decay, a: attack, r: release});
    }

    self.generateAdsfr = function(attack, decay, sustain, fade, release) {
      return T("ahdsfr", { f: fade, sustained: true, a: attack, d:decay, s: sustain,r: release}, T(self.wave));
    }

    self.generateSynthFromSettings = function(opts) {
      var env, osc, wave, opts, attack, decay, sustain, fade, release;
      opts = opts || {};
      attack = opts['attack'] || self.attack;
      decay = opts['decay'] || self.decay;
      sustain = opts['sustain'] || self.sustain;
      fade = opts['fade'] || self.fade;
      release = opts['release'] || self.release;
      wave = opts['wave'] || self.wave;

      // until i can fix the sustain issue, i'll use default
      env = self.generateAdsfr(attack, decay, App.Constants.DEFAULT_SUSTAIN, fade, release);
      
      self.initializeNoteBank();

      osc = T(wave);
      //osc = self.attachDelayAndDist(osc);
      self.synth = T('OscGen', { lv: 0.25, osc: osc, env: env, poly: true, mul: self.mul }).play();
    }

    self.initialize = function() {
      var dfd = $.Deferred();
      var opts = ['wave', 'attack', 'release', 'fade', 'sustain', 'decay', 'velocity', 'mul'];
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

    self.attachDelayAndDist = function(synth) {
      synth = T("dist" , {pre:60, post:-12}, synth);
      synth = T("delay", {fb :0.5, mix:0.2}, synth);
      return synth;
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

    self.setRelease = function(release) {
      self.release = release;
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

    self.setBPM = function(bpm) {
      self.Recorder.setBPM(bpm);
    }

    self.setBPL = function(bpl) {
      self.Recorder.setBPL(bpl);
    }

    self.setBFS = function(bfs) {
      self.BFS = bfs;
    }

    self.setReverb = function(reverb) {
      self.reverb = reverb;
    }

    self.setSynthMode = function(synthMode) {
      self.synthMode = synthMode;
      self.generateSynthFromSettings();
    }

    self.setMode = function(mode) {
      self.mode = mode;
      self.generateSynthFromSettings();
    }

    self.initialize();
    return self;
  }
  self = App.Synth.prototype;
  return App;
})(App);