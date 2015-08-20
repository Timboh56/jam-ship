(function(App) {
  
  // placeholder for synth field class
  App.Field = function(opts) {
    var self = this,
      fieldName = self.name = App.Helpers.capitalizeFirstLetter(opts['name']);

    self.onSet = opts['onSet'];

    self.set = function(val) {
      if (parseFloat(val)) val = parseFloat(parseFloat(val).toFixed(2));
      self.value = val;
      if (self.onSet) self.onSet(self.name, val);
    }

    self.value = App.Constants['DEFAULT_' + fieldName.toUpperCase()]
  };

  return App;
})(App || {});