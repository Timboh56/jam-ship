Organ = function(opts) {
  var self = this;
  for (var opt in opts) self[opt] = opts[opt];
  self.notes = {};

   self.generateSynthFromSettings = function (freq) {
      return T(self.wave, {freq: freq  * 1.01, mul: 0.05, phase: Math.PI * 0.25 });
    }

   function initializeNoteBank() {
    for (var i in Constants.FREQUENCIES)
      self.notes[i] = self.generateSynthFromSettings(Constants.FREQUENCIES[i]);
  }
}