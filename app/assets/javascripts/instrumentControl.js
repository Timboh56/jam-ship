var InstrumentControl = function (instrument) {
  var self = this;
  self.inputFieldsClass = instrument.inputFieldsClass; 
  self.instrument = instrument;
  self.keyboardOn = true;
  self.keyDown = false;
  self.prevKey = null;

  function attachKeyHandlers() {
    var keydown = false;
    window.document.onkeydown = function(event) {
      var keyPressed = getChar(event);

      //if (self.keyboardOn && !self.keyDown) {
        self.prevKey = keyPressed;
        self.instrument.playNoteFromKeys(keyPressed);
        self.keyDown = true;
      //}
    }
    $(document).on('change', '.' + self.inputFieldsClass , function (e) {
      var synthField = capitalizeFirstLetter($(this).data('synth-field'));
      var val = $(this).val();
      if (synthField == 'Volume' && (val < 0 || val > 0.99)) 
        $(this).val(Constants.DEFAULT_MUL);

      self.instrument['set' + synthField]($(this).val());
    });

    window.document.onkeyup = function(event) {
      //if (self.keyboardOn) {
        var keyPressed = getChar(event);
        self.instrument.stopNoteFromKeys(keyPressed);
        self.keyDown = false;
      //}
    }

    window.document.onkeypress = function(event) {
      var keyPressed = getChar(event);

      if (self.instrument.currentOctave > 1 && keyPressed == "Z")
        self.instrument.currentOctave -= 1;
      if (self.instrument.currentOctave < 4 && keyPressed == "X")
        self.instrument.currentOctave += 1;
    }
  }


  attachKeyHandlers();
}