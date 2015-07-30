(function(App) {
  App.Osc = function () {

  }

  App.Env = function () {
    var self = this;
    var table = [200, [4800, 150], [2400, 500]];
    var cutoff = T("env", {table:table}).bang();

    var VCO = T("saw", {mul:0.2});
    var VCF = T("lpf", {cutoff:cutoff, Q:10}, VCO).play();e

    var keydict = T("ndict.key");
    var midicps = T("midicps");
    T("keyboard").on("keydown", function(e) {
      var midi = keydict.at(e.keyCode);
      if (midi) {af
        VCO.freq.value = midicps.at(midi);
        cutoff.bang();
      }
    }).start();
  }

})(App);