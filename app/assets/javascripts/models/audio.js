(function(App){
  App.Audio = function(opts) {
    var self = this;
    self.buffers = {};
    self.audioContext = window.AudioContext = window.AudioContext || window.webkitAudioContext;

    function createSource(id, opts, buffer) {
      var source = self.audioContext.createBufferSource();
      if (buffer) source.buffer = buffer
      source = applyProperties(opts, source);
      self.buffers[id] = source;
      return source;
    }

    // Stop the audio.
    function stopSynth() {
      oscillator.stop(0);
    };

    function playSynth() {
      var oscillator = self.audioContext.createOscillator();
      var gainNode = self.audioContext.createGainNode();
      oscillator.type = 'triangle';
      gainNode.connect(myAudioContext.destination);
      oscillator.connect(gainNode);
      oscillator.start();
    }

    function playSound(buffer, time) {
      var source = self.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(self.audioContext.destination);
      source.start(time);
    }

    function playHelper(bufferNow, bufferLater, fadeTime) {
      var playNow = createSource(bufferNow);
      var source = playNow.source;
      var gainNode = playNow.gainNode;
      var duration = bufferNow.duration;
      var currTime = self.audioContext.currentTime;

      // Fade the playNow track in.
      gainNode.gain.linearRampToValueAtTime(0, currTime);
      gainNode.gain.linearRampToValueAtTime(1, currTime + fadeTime);
      // Play the playNow track.
      source.start(0);

      // At the end of the track, fade it out.
      gainNode.gain.linearRampToValueAtTime(1, currTime + duration - fadeTime);
      gainNode.gain.linearRampToValueAtTime(0, currTime + duration);
    }
  }

})(App);