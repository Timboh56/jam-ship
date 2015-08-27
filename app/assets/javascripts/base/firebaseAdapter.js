(function(App) {
  App.FirebaseAdapter = function (opts) {
    var self = this;

    self.channel = opts['channel'] || "test_channel";
    self.myDataRef = null;

    if (Firebase)
      self.myDataRef = new Firebase('https://pftxxze6h6m.firebaseio-demo.com/channels/' + self.channel);
    else
      throw "Did you forget to include Firebase?";

    self = App.Helpers.applyProperties(opts, self);

    this.broadcast = function(opts) {
      //opts = stringify(opts);
      self.myDataRef.set(opts);
    }

    this.onReceive = function(snapshot) {
      if (self["onReceiveFirebase"])
        self["onReceiveFirebase"](snapshot);
    }

    self.myDataRef.on('value', this.onReceive);
    self.myDataRef.child(self.channel).on('child_added', this.onReceive);

    return self;
  }

  return App;
})(App || {});