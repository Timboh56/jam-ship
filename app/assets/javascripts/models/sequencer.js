String.prototype.toUnderscore = function(){
  return this.replace(/([A-Z])/g, function($1){return "_"+$1.toLowerCase();});
};

(function(App) {
  App.Sequencer = function(opts) {
    'use strict';
    var self = this;
    self.recording = false;
    self.recorder = null;
    self.metronomeOn = false;
    self.metronomeObj = null;
    self.currentRecordId = null;
    self.buffers = {};
    self.blobs = [];
    self.onSaveBuffer = opts['onSaveBuffer'];
    self.onStartRecording = opts['onStartRecording'];
    self.onPlayRecording = opts['onPlayRecording'];
    self.onStopRecording = opts['onStopRecording'];
    self.InstrumentCRUD = new App.InstrumentCRUD(opts);
    self.notes = {};

    if(!saveAs) throw "FileSaver.js not included!";

    self.broadcast = opts['broadcast'];
    self.onCreateBuffer = opts['onCreateBuffer'];
    self.onDeleteBuffer = opts['onDeleteBuffer'];

    self.playMetronomeTick = function () {
      var osc = T("sin"),
        env = T("perc", {a:10, r:5}),
        oscenv = T("OscGen", {osc:osc, env:env, mul: self.metronomeVol.value}).play();

      oscenv.play();
      oscenv.noteOnWithFreq(600, self.metronomeVel.value);
    }

    self.toggleMetronome = function() {
      self.metronomeOn = !self.metronomeOn;
      var interval, beat;
      beat = 1

      if (self.metronomeOn) {
        var beatLength = 60000/self.bpm.value;
        self.metronomeObj = T("interval", { interval: beatLength }, (function(count) {
          self.playMetronomeTick();
          $('.record-time').html(beat);
          if (beat % self.bpl.value === 0) beat = 1;
          else beat = beat + 1;
        }).bind(this));
        self.metronomeObj.start();
      } else
        self.metronomeObj.stop();
    }

    self.setTrack = function(opts) {
      try {
        opts = opts || {};
        opts['id'] = opts['id'] || new Date().getUTCMilliseconds();

        self.buffers[opts['id']] = T('audio', { load: opts['url'] } ).on('ended', function() {
          this.pause();
        }).play();
        self.buffers[opts['id']].persists = true;
        if (self.onCreateBuffer) self.onCreateBuffer(opts['id']);
      } catch (err) {
        console.log('Error setting track: ' + err);
      }
    }

    self.initializeRecorder = function(opts) {
      var dfd, instrument, recorderOpts, recOpts;
      dfd = $.Deferred();
      recOpts = opts || {};

      if (recOpts['instrument'])
        instrument = recOpts['instrument'];
      else throw 'Please include an instrument to record';
      self.recorder = T('rec', { timeout: self.recordingTime.value || opts['recordingTime']}, instrument).on('ended', (function(buffer) {
        var t, timestamp, buf, sr, dataview, audioBlob, midiTracks = [], song = null;
        if (buffer.buffer.length != 0) {
          timestamp = new Date().getUTCMilliseconds();

          t = T('buffer', {buffer: buffer, loop:true}); // create buffer object
          t.buffer = buffer;
          self.recording = false;

          buf = buffer.buffer;      // buf = a Float32Array of data
          sr = buffer.samplerate;    //sample rate of the data

          dataview = _encodeWAV(buf, sr);

          // write to MIDI File
          for (var note in self.notes) {
            if (self.notes[note].length > 0)
              midiTracks.push(new MidiTrack({ events: self.notes[note] }));
          }

            song  = MidiWriter({ tracks: midiTracks });
            song.save();
 
          // save blob
          audioBlob = new Blob([dataview], { type: 'audio/wav' });
          self.blobs[timestamp] = audioBlob;
          self.currentRecordId = timestamp;

          self.buffers[timestamp] = t;
          self.onCreateBuffer.call(this, timestamp);
          self.play(timestamp);

          dfd.resolve(self);
        } else {
          dfd.reject(self);
        }

      }).bind(this));

      return dfd.promise();
    }

    self.toggleRecording = function(opts) {
      if (self.recording)
        self.stopRecording(opts);
      else {
        self.recording = true;
        self.delay.apply(this, [self.startRecording, self.bpl.value, opts])
          .done((function(res) {
            self = res;
          }).bind(this));
      }
    }

    self.delay = function(done, beats, opts) {
      var beats = beats || 4,
        i = beats,
        beatLength = 60000/self.bpm.value,
        ms = (self.bpm.value/60) * beatLength,
        func = null,
        dfd = $.Deferred();
        func = function(self, ms, i, done, opts, dfd) {
          try {
            if (opts.onTick) opts.onTick(i);
            if (i == 0 || self.recording == false) {
              done.call(this, opts);
              dfd.resolve(self);
            } else {
              setTimeout(function() {
                self.playMetronomeTick();
                i = i - 1;
                func.apply(this, [ self, ms, i, done, opts, dfd]);
              }, ms);
            }
          } catch (err) {
            dfd.reject(false);
          }
        };

        func.apply(this, [ self, ms, i, done, opts, dfd ]);

        return dfd.promise();
    }

    self.startRecording = function(opts) {
      var timestamp, recorder;
      if (self.onStartRecording) self.onStartRecording();
      recorder = self.initializeRecorder(opts).then((function(self) {
        $('.recording-status-text').html('');
        $('.record-btn').removeClass('hide');
        $('.stop-btn').addClass('hide');
      }).bind(this));

      $('.recording-status-text').html('recording..');
      $('.record-btn').addClass('hide');
      $('.stop-btn').removeClass('hide');
      self.startTime = self.getNow();
      self.recording = true;
      self.recorder.start();
    }

    self.stop = function(recordId) {
      self.buffers[recordId].pause();
      if (self.onStopRecording) {
        self.onStopRecording({
          id: recordId
        });
      }
    }

    self.saveBuffer = function(recordId) {
      self.InstrumentCRUD.saveBuffer({
        id: recordId,
        blob: self.blobs[recordId]
      }).then(self.onSaveBuffer, self.onSaveBuffer);
    }

    self.exportBuffer = function(recordId) {
      saveAs(self.blobs[recordId], 'track ' + recordId + '.wav');
    }

    self.editBuffer = function(recordId) {
      $('#edit-clip-' + recordId).toggleClass('focus');
      $('#clip-name-' + recordId).toggleClass('focus');
    }

    self.deleteBuffer = function(recordId) {
      self.stop(recordId);
      if (self.buffers[recordId].persists) self.InstrumentCRUD.deleteClip(recordId);
      delete self.buffers[recordId];
      self.onDeleteBuffer.call(this, recordId);
    }

    self.play = function(recordId) {
      try {
        self.buffers[recordId].bang().play();
        if (self.onPlayRecording) self.onPlayRecording({
          id: recordId,
          buffer: self.buffers[recordId]
        });
      }catch(err) {
        console.log('Could not play: ' + err);
      }
    }

    self.getNow = function() {
      return new Date().getTime();
    }

    self.elapsedSince = function(startTime) {
      return self.getNow() - (startTime || self.startTime);
    }

    self.stopRecording = function(opts) {
      if (self.recorder) self.recorder.stop(); 
      var now = new Date();
      //self.recordingTime = self.elapsedSince();
      self.recording = false;
    }

    // convert BPM into recording Time in milliseconds
    self.calculateRecordingTime = function(bpm, bpl) {
      var beatsPerLoop, loopsPerMinute;
      beatsPerLoop = bpl || 4;
      loopsPerMinute = (bpm / bpl);
      return 60000/loopsPerMinute;
    }

    self.addToMIDINoteBuffer = function(note) {
      var midiNote = MidiEvent.createNote(note, false);
      self.notes[note] = self.notes[note].concat(midiNote);
    }

    // functions to convert timbre buffer to WAV
    function _encodeWAV(buf, sr) {
      var buffer = new ArrayBuffer(44 + buf.length * 2);
      var view = new DataView(buffer);

      /* RIFF identifier */
      _writeString(view, 0, 'RIFF');
      /* file length */
      view.setUint32(4, 32 + buf.length * 2, true);
      /* RIFF type */
      _writeString(view, 8, 'WAVE');
      /* format chunk identifier */
      _writeString(view, 12, 'fmt ');
      /* format chunk length */
      view.setUint32(16, 16, true);
      /* sample format (raw) */
      view.setUint16(20, 1, true);
      /* channel count */
      view.setUint16(22, 1, true);
      /* sample rate */
      view.setUint32(24, sr, true);
      /* byte rate (sample rate * block align) */
      view.setUint32(28, sr *2 , true);
      /* block align (channel count * bytes per sample) */
      view.setUint16(32, 2, true);
      /* bits per sample */
      view.setUint16(34, 16, true);
      /* data chunk identifier */
      _writeString(view, 36, 'data');
      /* data chunk length */
      view.setUint32(40, buf.length * 2, true);

      _floatTo16BitPCM(view, 44, buf);

      return view;
    }

    function _initialize() {
      for (var clip in opts['clips']) self.setTrack(opts['clips'][clip]);

      for(var i = 0; i < App.Constants.Fields.SEQUENCER.length; i++) {
        var el = App.Constants.Fields.SEQUENCER[i],
          constantKey = el.toUnderscore().toUpperCase(),
          val  = App.Constants['DEFAULT_' + constantKey];
        self[el] = new App.Field({ name: el, value: val });
      };

      for (var i in App.Constants.FREQUENCIES) self.notes[i] = [];

    }

    function _floatTo16BitPCM(output, offset, input){
      for (var i = 0; i < input.length; i++, offset+=2){
        var s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }
    }

    function _writeString(view, offset, string){
      for (var i = 0; i < string.length; i++){
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    }

    _initialize();
  }

  return App;
})(App || {});