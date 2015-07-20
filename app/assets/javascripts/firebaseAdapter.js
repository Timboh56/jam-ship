var FirebaseAdapter = function (opts) {
  var self = this;

  self.channel = "test_channel"
  self.myDataRef = null;
  self.opts = opts;

  if (Firebase)
    self.myDataRef = new Firebase('https://pftxxze6h6m.firebaseio-demo.com/');
  else
    throw "Did you forget to include Firebase?";

  this.broadcast = function(note) {
    self.myDataRef.push({
      channel: {
        note: note
      }
    });
  }

  this.onReceive = function(snapshot) {
    var note, velocity;

    note = snapshot.note;
    velocity = snapshot.velocity;

    self.opts["onReceive"].call(note, velocity);
  }

  self.myDataRef.child(self.channel).on('child_added', this.onReceive);
}