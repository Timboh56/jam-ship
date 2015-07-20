var MidiControl = function(playFunction) {
  var self = this;

  if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess({
        sysex: false
      }).then(onMidiSuccess, onMidiFailure);
  }

  function onMidiSuccess(midiAccess) {
    var midi, inputs, i;
    midi = midiAccess;
    inputs = midi.inputs.values();
    for (i = inputs.next(); i && !i.done; i.next()) {
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

    switch (type) {
      case 144:
        self.playNote(note, velocity);
        break;
      case 128:
        self.PauseNote(note, velocity);
        break;
    }
    console.log("Midi data",data);
  }

  function frequencyFromNoteNumber(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }
};