(function(App) {
    App.Constants = {
      DEFAULT_WAVE: "sin",
      DEFAULT_MUL: 0.25,
      DEFAULT_ATTACK: 50,
      DEFAULT_RELEASE: 500,
      DEFAULT_DECAY: 50,
      DEFAULT_FADE: 50, 
      DEFAULT_SUSTAIN: 0.25,
      DEFAULT_VELOCITY: 60,
      DEFAULT_BPL: 4,
      DEFAULT_BPM: 128,
      DEFAULT_METRONOME_FREQ: 1500,
      DEFAULT_METRONOME_VEL: 127,
      FREQUENCIES: {
        "C1": 32.7032,
        "C#1": 34.6478,
        "D1": 36.7081,
        "D#1": 38.8909,
        "E1": 41.2034,
        "F1": 43.6535,
        "F#1": 46.2493,
        "G1": 48.9994,
        "G#1": 51.9131,
        "A1": 55.0000,
        "A#1": 58.2705,
        "B1": 61.7354,
        "C2": 65.4,
        "C#2": 69.2,
        "D2": 73.4,
        "D#2": 77.78,
        "E2": 82.41,
        "F2": 87.31,
        "F#2": 92.50,
        "G2": 97.99,
        "G#2": 103.83,
        "A2": 110,
        "A#2": 116.54,
        "B2": 123.471,
        "C3": 130.82,
        "C#3": 138.59,
        "D3": 146.83,
        "D#3": 155.56,
        "E3": 164.81,
        "F3": 174.61,
        "F#3": 185,
        "G3": 196,
        "G#3": 207.65,
        "A3": 220,
        "A#3": 233.08,
        "B3": 246.94,
        "C4": 261.63,
        "C#4": 277.18, 
        "D4": 293.66,
        "D#4": 311.13,
        "E4": 329.63,
        "F4": 349.23,
        "F#4": 369.99,
        "G4": 392,
        "G#4": 415.3,
        "A4": 440,
        "A#4": 466.16,
        "B4": 493.88,
        "C5": 523.25,
        "C#5": 554.37,
        "D5": 587.33,
        "D#5": 622.25,
        "E5": 659.26,
        "F5": 698.46,
        "F#5": 739.99, 
        "G5": 783.99,
        "G#5": 830.61,
        "A5": 880,
        "A#5": 932.33,
        "B5": 987.77,
        "C6": 1046.50,
        "C#6": 1108.79,
        "D6": 1174.66,
        "D#6": 1244.51,
        "E6": 1318.51,
        "F6": 1396.91,
        "F#6": 1479.98,
        "G6": 1567.98,
        "G#6": 1661.22,
        "A6": 1760,
        "A#6": 1864.66,
        "B6": 1975.53
      },

      KEYTONOTE: {
        "A": "C",
        "W": "C#",
        "S": "D",
        "E": "D#",
        "D": "E",
        "F": "F",
        "T": "F#",
        "G": "G",
        "Y": "G#",
        "H": "A",
        "U": "A#",
        "J": "B",
        "K": "C",
        "O": "C#",
        "L": "D",
        "P": "D#"
      },

      COLORS: {
        "C": "#1dd2af",
        "C#": "#16a085",
        "D": "#2ecc71",
        "D#": "#27ae60",
        "E": "#3498db",
        "F": "#2980b9",
        "F#": "#9b59b6",
        "G": "#8e44ad",
        "G#": "#34495e",
        "A": "#2c3e50",
        "A#": "#f1c40f",
        "B": "#c0392b",
        "C": "#2c3e50",
        "C#": "#34495e",
        "D": "#d35400",
        "D#": "#f39c12"
      },
      WAVES: ["sin", "tri", "saw"],
      NOTES: ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]
    };

    return App;
})(App || {});