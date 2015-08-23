(function(App) {

  /** InstrumentControl is the interface module between instruments
    * and the UI (controls, selectors, inputs, keyboard, etc).
    */
  App.InstrumentControl = function (opts) {
    var self = this;
    self.inputFieldsClass = opts['inputFieldsClass']; 
    self.instrument = opts['instrument'];
    self.keyboardOn = true;
    self.keyDown = false;
    self.prevKey = null;

    self = App.Helpers.applyProperties(opts, self);

    self.onChangeInput = opts['onChangeInput'];

    $('.' + self.inputFieldsClass).on('change', opts['onChangeInput']);

    self.disable = function() {
      window.document.onkeydown = null;
      window.document.onkeyup = null;
      window.document.onkeypress = null;
    }

    self.enable = function() {
      window.document.onkeydown = self['onKeyDown'];
      window.document.onkeyup = self['onKeyUp'];
      window.document.onkeypress = self['onKeyPress']; 
    }

    self.enable();
    return self;
  };

  return App;
})(App || {});