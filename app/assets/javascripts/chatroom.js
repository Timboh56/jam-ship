(function(App){
  App.Chatroom = function(opts) {
    var self = this;
    self = App.Helpers.applyProperties(opts, self);

    if(!self.firebaseAdapter) throw 'Did you forget to include firebaseAdapter?';
    function onSubmit(e) {
      var val = $('#message-text-field').val();
    
      if (val.replace(' ', '') != '') {
        val['align'] = 'text-right';
        self.firebaseAdapter.broadcast({
          message: val,
          name: $("#current-user-name").val() || 'Guest ' + Math.random()
        });
        $('#message-text-field').val('');

        m = $('#messages-container');
        m.scrollTop(m[0].scrollHeight);
      }
    }

    $(self.messageFieldSelector).on('focus', self.onFocus);
    $(self.messageFieldSelector).on('blur', self.onBlur);
    $(self.messageFieldSelector).on('keypress', function(e) {
      if (self.onKeyPress) self.onKeyPress();
      if (e.keyCode == 13) onSubmit(e);
    });
    $(self.chatFormSelector).on('submit', onSubmit);
  }

  return App;
})(App || {});