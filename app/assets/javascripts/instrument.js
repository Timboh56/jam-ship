/**
  * Instrument take in opts
  *   opts: { 
  *     playFunction: play()
  *   }
  */
var Instrument = function(opts) {
  "use strict";
  var self, prop, keys, noteToFreq;

  Instrument.prototype = new MidiControl(opts);

  self = this;
  self.keyboardOn = true;
  self.currentOctave = 3;
  self.firebaseInterface = new FirebaseAdapter({
    onReceive: self.playFunction
  });

  for (prop in opts)
    self[prop] = opts[prop];

  // playNote takes in a note and velocity and
  // calls child's play method
  self.playNote = function(keyPressed) {
    var note, velocity;
    if (self.playFunction && Constants.KEYTONOTE[keyPressed]) {

      // look up note and velocity
      note = noteLookUp(keyPressed);

      self.playFunction(note, velocity);
     }
   }

  self.stopNote = function(keyPressed) {
    var note, velocity;
    if (self.stopFunction && Constants.KEYTONOTE[keyPressed]) {

      // look up note and velocity
      note = noteLookUp(keyPressed);

      self.stopFunction(note, velocity);
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
        self.playNote(keyPressed);
      }
    }

    window.document.onkeyup = function(event) {
      if (self.keyboardOn) {
        var keyPressed = getChar(event);
        self.stopNote(keyPressed);
      }
    }

    window.document.onkeypress = function(event) {
      var keyPressed = getChar(event);
      if (keyPressed == "Z") self.currentOctave -= 1;
      if (keyPressed == "X") self.currentOctave += 1;
    }
  }

  attachKeyHandlers();
};