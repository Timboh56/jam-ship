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
  self.keyboardOn = true;
  self.currentOctave = 3;

  self.firebaseInterface = new FirebaseAdapter({
    onReceive: self.playFunction
  });

  self.simplePlay = function() {};
  self.simplePause = function() {};
  self.handleMidi = function() {};

  // playNote takes in a note and velocity and
  // calls child's play method
  self.playNoteFromKeys = function(keyPressed) {
    var note, velocity;
    if (self.playFunction && Constants.KEYTONOTE[keyPressed]) {

      // look up note and velocity
      note = noteLookUp(keyPressed);

      self.playFunction(note, velocity);
     }
   }

  self.stopNoteFromKeys = function(keyPressed) {
    var note, velocity;
    if (self.stopFunction && Constants.KEYTONOTE[keyPressed]) {

      // look up note and velocity
      note = noteLookUp(keyPressed);

      self.stopFunction(note);
    }
  }

  function noteLookUp(key) {
    var octave = self.currentOctave;

    if (["K", "O", "L", "P"].indexOf(key) != -1)
      octave += 1;

    return Constants.KEYTONOTE[key] + octave;
  }

  function getChar(event) {
    return String.fromCharCode(event.keyCode || event.charCode).toUpperCase();
  }

  function attachKeyHandlers() {
    window.document.onkeydown = function(event) {
      if (self.keyboardOn) {
        var keyPressed = getChar(event);
        self.playNoteFromKeys(keyPressed);
      }
    }

    window.document.onkeyup = function(event) {
      if (self.keyboardOn) {
        var keyPressed = getChar(event);
        self.stopNoteFromKeys(keyPressed);
      }
    }

    window.document.onkeypress = function(event) {
      var keyPressed = getChar(event);

      if (self.currentOctave > 1 && keyPressed == "Z")
        self.currentOctave -= 1;
      if (self.currentOctave < 4 && keyPressed == "X")
        self.currentOctave += 1;
    }
  }

  for (prop in opts) self[prop] = opts[prop];

  self.midiControl = new MidiControl(self);
  
  attachKeyHandlers();
};