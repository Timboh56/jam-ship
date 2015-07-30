(function(App) {
  App.MidiControl = function(opts) {
    var self = this;
    for (var prop in opts) self[prop] = opts[prop];

    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({
          sysex: false
        }).then(onMidiSuccess, onMidiFailure);
    }

    function onMidiSuccess(midiAccess) {
      var midi, inputs, input;
      midi = midiAccess;
      inputs = midi.inputs.values();
      for (input = inputs.next(); input && !input.done; input = inputs.next()) {
        input.value.onmidimessage = onMidiMessage;
      }
    }

    function onMidiFailure(e) {
      console.log("[Error] There was a problem accessing Web Midi");
    }

    function onMidiMessage(event) {
      var data = event.data,
          cmd = data[0] >> 4,
          channel = data[0] & 0xf,
          type = data[0] & 0xf0,
          note = data[1],
          velocity = data[2];
      note = noteFromNoteNumber(note);
      self.onMidiMessage.call(this, note, velocity);
    }

    function noteFromNoteNumber(note) {
      var octave, noteIndex;
      octave = (note / 12) - 1;
      noteIndex = (note % 12);
      return App.Constants.NOTES[noteIndex] + parseInt(octave);
    }
  };

  return App;
})(App || {});