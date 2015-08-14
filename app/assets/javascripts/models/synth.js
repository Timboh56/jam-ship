(function(App) {
  var self;
  App.Synth = function(opts) {
    var parent, freqSlide, self, opts, notes, onChangeInput;

    opts = $.extend({}, opts, {
      onReceive: (function(val) {
        val = $.extend({}, val, { receiving: true });
        if (val.url) {
          self.Sequencer.setTrack(val);
        } else
          self.play(val);
      }).bind(this),

      onMidiMessage: opts['onMidiMessage'] || function(note, velocity) {
        if (velocity > 0 && self.mode == 'live')
          self.play(note, velocity);
        else
          self.stop({ note: note });
      },
      inputFieldsClass: opts['inputFieldsClass'],

      onKeyDown: (function(event) {
        var keyPressed, note, velocity;
        keyPressed = getChar(event);
        note = self.noteLookUp.apply(self, [keyPressed]);
        if (self.InstrumentControl.keyboardOn && 'live' == self.mode) {
          if (App.Constants.KEYTONOTE[keyPressed] && !self.notes[note].keyDown) {
            self.notes[note].keyDown = true;
            self.play({
              note: note,
              velocity: self.velocity
            });
          }
        }
      }).bind(this),

      onKeyUp: (function(event) {
        var keyPressed, note, velocity;

        keyPressed = getChar(event);
        note = self.noteLookUp.apply(self, [keyPressed]);
        if (self.InstrumentControl.keyboardOn && 'live' == self.mode) {
          if (App.Constants.KEYTONOTE[keyPressed] && self.notes[note].keyDown) {
            self.notes[note].keyDown = false;
            self.stop({ note: note });
          }
        }
      }).bind(this),

      onKeyPress: (function(event) {
        var keyPressed;
        keyPressed = getChar(event);
        if (self.currentOctave > 1 && keyPressed == "Z")
          self.decrementCurrentOctave()
        if (self.currentOctave < 5 && keyPressed == "X")
          self.incrementCurrentOctave()
        if (keyPressed == 'R') {
          self.Sequencer.toggleRecording({
            instrument: self.getCurrentInstrument()
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


    self = App.Synth.prototype = new App.Instrument(opts);

    self.opts = opts,
    self.notes = {},
    self.freqs = {};
    self.synthMode = "envelope" // or "envelope"
    self.inputFieldsClass = opts['inputFieldsClass'];
    self.wave = opts['wave'] || App.Constants.DEFAULT_WAVE;
    self.mul = App.Constants.DEFAULT_MUL
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

    self.generateLPF = function(freq, velocity, table) {
      var table = table || [ 200, [ 4800, 150 ], [ 2400, 500 ] ];
      var cutoff = T("env", {table:table }).bang();
      var VCO = T("saw", {mul: self.mul, freq: freq });
      return T("lpf", {cutoff:cutoff, Q:10}, VCO);
    }

    self.generatePluck = function(attack, decay, sustain, release) {
      var env = T("perc", {a: attack || self.attack, r: release || self.release});
      return T("PluckGen", {env:env, mul:0.5}).play();
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
      env = self.generateEnv(attack, decay, App.Constants.DEFAULT_SUSTAIN, fade, release);
            
      self.synthEnv = env;

      osc = T(wave);
      //osc = self.attachDelayAndDist(osc);
      self.initializeNoteBank();

      switch(self.synthMode)
      {
        case 'envelope':
          self.synth = T('OscGen', { lv: 0.25, osc: osc, env: env, poly: 4, mul: self.mul }).play();
          break;
        case 'pluck':
          self.synth = self.generatePluck(self.attack, self.decay, self.sustain, self.release);
          break;
      } 

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

        //self.generateLPF(App.Constants.FREQUENCIES[i]); 
        self.notes[i] = T(self.wave, {freq: App.Constants.FREQUENCIES[i] * 1.01, mul: self.mul, phase: Math.PI * 0.25 });
        self.notes[i].noteInterval = 0;
        self.notes[i].startTime = null;
      }
    }

    self.play = function(opts) {
      var note = opts['note'],
        velocity = opts['velocity'],
        receiving = opts['receiving'];

      if (self.opts["onPlay"]) self.opts["onPlay"].apply(this, [opts]);
      self.playNote.apply(this, [note, velocity]);
    }

    self.playNote = function(note, velocity, noteInterval) {
      var freq = App.Constants.FREQUENCIES[note];

      switch(self.synthMode)
      {
        case 'organ':
          self.notes[note].play();
          break;
        case 'envelope':
          self.synth.noteOnWithFreq(freq, velocity);
          break;
        case 'pluck':
          self.synth.noteOnWithFreq(freq, velocity);
          break;
      }
    }

    self.playIndividualNote = function(note, freq, velocity) {
      if (self.synthMode == 'organ')
        self.notes[note].play();
      else
        self.synth.noteOnWithFreq(freq, velocity);
    }

    self.stop = function(opts) {
      var note = opts['note'];
      self.stopNote(note);
      if (self.opts["onStop"]) self.opts["onStop"].apply(this, [opts]);
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


    self.getCurrentInstrument = function() {
      if (self.synthMode == 'organ')
        return self.notes;
      else
        return self.synth;
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

    self.setBpm = function(bpm) {
      self.Sequencer.setBPM(bpm);
    }

    self.setBfs = function(bfs) {
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

    $(['saveBuffer', 'setBpm', 'setBpl', 'setRecordingTime', 'setMetronomeVol', 'setMetronomeVel']).each((function(index, el) {
      self[el] = function(field) {
        self.Sequencer[el].call(this, field);
      }
    }).bind(this));

    self.initialize();
    return self;
  }
  self = App.Synth.prototype;
  return App;
})(App);