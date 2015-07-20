var MidiControl = function(instrument) {
  var self = this;

  self.instrument = instrument || new Instrument();

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
    self.instrument.handleMidi(note, velocity);
  }

  function noteFromNoteNumber(note) {
    var octave, noteIndex;
    octave = (note / 12) - 1;
    noteIndex = (note % 12);
    return Constants.NOTES[noteIndex] + parseInt(octave);
  }
};