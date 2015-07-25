/**
  * Instrument take in opts
  *   opts: { 
  *     playFunction: play()
  *   }
  */
var Instrument = function(opts) {
  "use strict";
  var self, prop, keys, noteToFreq;

  self = this;
  self.mode = "listening";
  self.currentOctave = 3;

  // milliseconds since last note
  self.noteInterval = 0;

  self.velocity = opts["velocity"] || 128;

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

  self.broadcast = function(note, velocity, noteInterval) {
    if (self.mode == "playing") {
      self.firebaseInterface.broadcast({
        note: note,
        velocity: velocity,
        noteInterval: noteInterval || 0
      });
    }
  };

  self.handleMidi = function() {};

  // playNote takes in a note and velocity and
  // calls child's play method
  self.playNoteFromKeys = function(keyPressed) {
    var note, velocity;
    if (self.play && Constants.KEYTONOTE[keyPressed]) {

      // look up note and velocity
      note = noteLookUp(keyPressed);

      self.play(note, self.velocity);
     }
   }

  self.stopNoteFromKeys = function(keyPressed) {
    var note, velocity;
    if (self.stop && Constants.KEYTONOTE[keyPressed]) {

      // look up note and velocity
      note = noteLookUp(keyPressed);

      self.stop(note);
    }
  }

  function noteLookUp(key) {
    var octave = self.currentOctave;

    if (["K", "O", "L", "P"].indexOf(key) != -1)
      octave += 1;

    return Constants.KEYTONOTE[key] + octave;
  }

  for (prop in opts) self[prop] = opts[prop];

  self.MidiControl = new MidiControl(self);
  
  self.InstrumentControl = new InstrumentControl(self);
};