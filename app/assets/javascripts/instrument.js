(function(App) {
  "use strict";

  /**
    * Instrument take in opts
    *   opts: { 
    *     playFunction: play()
    *   }
    */
  App.Instrument = function(opts) {
    var self = App.Instrument.prototype;
    self.mode = "playing";
    self.currentOctave = opts['currentOctave'] || 3;
    self.inputFieldsClass = opts['inputFieldsClass'];
    self.notes = {};
    self.noteInterval = 0; // milliseconds since last note
    self.velocity = App.Constants.DEFAULT_VELOCITY;
    for (var prop in opts) self[prop] = self[prop] || opts[prop];

    self.firebaseInterface = new FirebaseAdapter({
      onReceive: function(snapshot) {
        if (self.mode == "listening") {
          var val = snapshot.val();
          if(val.velocity == 0)
            self.stopNote(val.note);
          else
            self.playNote(val.note, val.velocity, val.noteInterval);
        }
      }
    });

    self.MidiControl = new App.MidiControl({
      onMidiMessage: self.onMidiMessage
    });

    opts['broadcast'] = self.firebaseInterface.broadcast;

    self.Recorder = new App.Recorder(opts);

    self.InstrumentControl = new App.InstrumentControl({
      inputFieldsClass: opts['inputFieldsClass'],
      onKeyDown: opts['onKeyDown'],
      onKeyUp: opts['onKeyUp'],
      onKeyPress: opts['onKeyPress'],
      onChangeInput: opts['onChangeInput']
    });

    self.startNoteInterval = function(note) {
      return new Date().getTime();
    }

    self.elapsedSinceLastNote = function(startTime) {
      return new Date().getTime() - startTime;
    }

    self.broadcast = function(note, velocity, noteInterval) {
      if (self.mode == "playing") {
        self.firebaseInterface.broadcast({
          note: note,
          velocity: velocity,
          noteInterval: noteInterval || 0
        });
      }
    };

    self.toggleRecording = function() {
      //if (self)
    }

    self.noteLookUp = function(key) {
      var octave = this.currentOctave || 3;

      if (['K', 'O', 'L', 'P'].indexOf(key) != -1)
        octave += 1;

      return App.Constants.KEYTONOTE[key] + octave;
    }
  }

  return App;
})(App);