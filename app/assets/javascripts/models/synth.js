(function(App) {
  var self;
  App.Synth = function(opts) {
    var parent, self, opts, notes, onChangeInput;

    opts = $.extend({}, opts, {
      onReceive: (function(val) {
        val = $.extend({}, val, { receiving: true });
        if (val.url)
          self.Sequencer.setTrack(val);
        if (val.velocity > 0)
          self.play(val);
        else
          self.stop(val);

      }).bind(this),

      onMidiMessage: opts['onMidiMessage'] || function(note, velocity) {
        if (velocity > 0 && self.mode.value == 'live')
          self.play({note: note, velocity: velocity });
        else
          self.stop({ note: note });
      },

      inputFieldsClass: opts['inputFieldsClass'],

      onKeyDown: function(event) {
        var keyPressed, note, velocity;
        keyPressed = App.Helpers.getChar(event);
        note = self.noteLookUp.apply(self, [keyPressed]);
        if (self.InstrumentControl.keyboardOn && 'live' == self.mode.value) {
          if (App.Constants.KEYTONOTE[keyPressed] && !self.notes[note].keyDown) {
            self.notes[note].keyDown = true;
            self.play({
              note: note,
              velocity: self.velocity
            });
          }
        }
      },

      onKeyUp: function(event) {
        var keyPressed, note, velocity;

        keyPressed = App.Helpers.getChar(event);
        note = self.noteLookUp.apply(self, [keyPressed]);
        if (self.InstrumentControl.keyboardOn && 'live' == self.mode.value) {
          if (App.Constants.KEYTONOTE[keyPressed] && self.notes[note].keyDown) {
            self.notes[note].keyDown = false;
            self.stop({ note: note });
          }
        }
      },

      onKeyPress: function(event) {
        var keyPressed;
        keyPressed = App.Helpers.getChar(event);
        if (self.currentOctave > 1 && keyPressed == "Z")
          self.decrementCurrentOctave()
        if (self.currentOctave < 5 && keyPressed == "X")
          self.incrementCurrentOctave()
        if (keyPressed == 'R') {
          self.Sequencer.toggleRecording({
            instrument: self.getCurrentInstrument(),
            onTick: opts.onTick
          });
        }
      },

      onChangeInput: (function(el) {
        var target = (el.val ? el : $(el.currentTarget)),
          val = (parseFloat(target.val()) ? parseFloat(target.val()) : target.val()),
          dataType = target.data('type'),
          max = parseFloat(target.data('max')),
          id = target.attr('id'),
          synthField = target.data('synth-field');

        if (dataType == 'seconds')
          val = parseFloat(val) * 1000;

        if (self[synthField]) self[synthField].set.call(this, val);
        else debugger
      }).bind(this)
    });

    self = App.Synth.prototype = new App.Instrument(opts);

    self.opts = opts,
    self.notes = {},
    self.freqs = {};
    self.inputFieldsClass = opts['inputFieldsClass'];
    self.opts["play"] = self.play;
    self.opts["stop"] = self.stop;

    if (!T) throw "Could not find Timbre JS. Did you include it?";

    self.incrementCurrentOctave = function() {
      self.currentOctave = self.currentOctave + 1;
      _generateSynthFromSettings();
    }

    self.decrementCurrentOctave = function() {
      self.currentOctave = self.currentOctave - 1;
      _generateSynthFromSettings();
    }

    self.generateOsc = function(freq) {
      return T(self.wave.value, {freq: freq  * 1.01, mul: 0.05, phase: Math.PI * 0.25 });
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
      var env = T("perc", {a: attack || self.attack.value, r: release || self.release.value});
      return T("PluckGen", {env:env, mul:0.5}).play();
    }

    self.generateAdsfr = function(attack, decay, sustain, fade, release) {
      return T("ahdsfr", { h: 0.1, f: fade, a: attack, d:decay, s: sustain, r: release}, T(self.wave.value));
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

      switch(self.synthMode.value)
      {
        case 'organ':
          self.notes[note].play();
          break;
        case 'envelope':
          self.synth.noteOnWithFreq(freq, velocity).listen(self.clip);
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

    self.setReverb = function(reverb) {
      self.reverb = parseFloat(reverb) || App.Constants.DEFAULT_REVERB;
      self.reverbSetting.set('mix', self.reverb);
      _generateSynthFromSettings();
    }

    function _generateSynthFromSettings(opts) {
      var env, clip, osc, oscGen, wave, opts, attack, decay, sustain, fade, release, mul, reverb;

      opts = opts || {};
      attack = opts['attack'] || self.attack.value;
      decay = opts['decay'] || self.decay.value;
      sustain = opts['sustain'] || self.sustain.value;
      fade = opts['fade'] || self.fade.value;
      release = opts['release'] || self.release.value;
      wave = opts['wave'] || self.wave.value;
      mul = opts['mul'] || self.mul.value;
      reverb = opts['reverb'] || self.reverb.value;

      env = self.generateAdsfr(attack, decay, sustain, fade, release);
            
      self.synthEnv = env;

      osc = T(wave);

      self.oscGen = self.oscGen ? self.oscGen.bang().play() : T('OscGen', { lv: 0.25, osc: osc, env: env, poly: 4, mul: mul }).play();
      
      // THIS LINE NEEDS TO BE REFACTORED WITH DEBOUNCING OR CACHING OF OSCGEN
      //self.oscGen = T('OscGen', { lv: 0.25, osc: osc, env: env, poly: 4, mul: mul }).play();
      

      //self.reverb = T("reverb", {room:0.9, damp:0.2, mix:0.45}, this).play();

      self.reverb = self.reverb || App.Constants['DEFAULT_REVERB'];

      //osc = self.attachDelayAndDist(osc);
      _initializeNoteBank();

      switch(self.synthMode.value)
      {
        case 'envelope':
          self.synth = self.oscGen;
          break;
        case 'pluck':
          self.synth = self.generatePluck(self.attack, self.decay, self.sustain, self.release);
          break;
      } 

    }

    function _initialize() {
      var dfd = $.Deferred();

      for(var i = 0; i < App.Constants.Fields.SYNTH.length; i++) {
        var el = App.Constants.Fields.SYNTH[i];

        self[el] = new App.Field({
          name: el,
          onSet: function(key, val) {
            var newEnv = self.generateAdsfr(
              self.attack.value,
              self.decay.value,
              self.sustain.value,
              self.fade.value,
              self.release.value
            );

            self.synth.set({ env: newEnv });
            self.synth.set({ mul: self.mul.value });

            _generateSynthFromSettings();
          }
        });
      };

      _generateSynthFromSettings();
      return dfd.promise();
    }

    function _initializeNoteBank() {
      for (var i in App.Constants.FREQUENCIES) {

        //self.generateLPF(App.Constants.FREQUENCIES[i]); 
        self.notes[i] = T(self.wave.value, {freq: App.Constants.FREQUENCIES[i] * 1.01, mul: self.mul, phase: Math.PI * 0.25 });
        self.notes[i].noteInterval = 0;
      }
    }

    _initialize();

    return self;
  }

  return App;
})(App);