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

    for (var prop in opts) self[prop] = opts[prop];

    window.document.onkeydown = opts['onKeyDown'];

    self.onChangeInput = opts['onChangeInput'];

    $('.' + self.inputFieldsClass).on('change', opts['onChangeInput']);

    window.document.onkeyup = opts['onKeyUp'];

    window.document.onkeypress = opts['onKeyPress'];
  };

  return App;
})(App || {});