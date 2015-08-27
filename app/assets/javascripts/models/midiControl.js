(function(App) {
  App.MidiNote = function(note_number) {
    this.note_number = note_number;
    this.begin = -1;
    this.end = -1;
  }

  App.MidiControl = function(opts) {
    var self = this;
    self = App.Helpers.applyProperties(opts, self)
    self.noteEvents = [];

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
      //self.noteEvents.push(MidiEvent.createNote(note, false));
      self.onMidiMessage.call(this, note, velocity);
    }

    function noteFromNoteNumber(note) {
      var octave, noteIndex;
      octave = (note / 12) - 1;
      noteIndex = (note % 12);
      return App.Constants.NOTES[noteIndex] + parseInt(octave);
    }

    function addtimerEventListener() {
      timer_worker.addEventListener('noteReceived', function(e) {
        if (e.data.note > -1) {
          console.log("!!!!!"+e.data.note);
          millisec = e.data.time;
          var note_index = e.data.note;
          if (notes[note_index].begin > -1) {
            notes[note_index].end = millisec;
          } else {
            notes[note_index].begin = millisec;
          }

          console.log("note  " + notes[note_index].note_number + " from " + notes[note_index].begin + " ms to " + notes[note_index].end + " ms");
        } else {
          time.innerHTML = e.data.time;
        }
      }, false);
    }
  };

  return App;
})(App || {});