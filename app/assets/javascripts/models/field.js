(function(App) {
  
  // placeholder for synth field class
  App.Field = function(opts) {
    var self = this,
      fieldName = self.name = App.Helpers.capitalizeFirstLetter(opts['name']);

    self.onSet = opts['onSet'];

    self.set = function(val) {
      if (parseFloat(val)) {
        if(parseFloat(val) % 1 < 0.1) val = parseInt(val);
        else val = parseFloat(val);
      }

      self.value = val;
      if (self.onSet) self.onSet(self.name, val);
    }

    self.value = App.Constants['DEFAULT_' + fieldName.toUpperCase()]
  };

  return App;
})(App || {});