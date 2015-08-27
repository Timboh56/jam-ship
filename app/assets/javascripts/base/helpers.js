(function(App) {

  var self = App.Helpers = {};
  self.capitalizeFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  self.displayChatMessage = function(name, text) {
    $('<div/>').text(text).prepend($('<em/>').text(name+': ')).appendTo($('#messagesDiv'));
    $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
  };

  self.getChar = function(event) {
    return String.fromCharCode(event.keyCode || event.charCode).toUpperCase();
  };

  self.applyProperties = function(src, dest) {
    for (var prop in src) dest[prop] = src[prop];
    return dest;
  };

  self.str2Bytes = function(str, finalBytes) {
      if (finalBytes) {
          while ((str.length / 2) < finalBytes) { str = "0" + str; }
      }

      var bytes = [];
      for (var i=str.length-1; i>=0; i = i-2) {
          var chars = i === 0 ? str[i] : str[i-1] + str[i];
          bytes.unshift(parseInt(chars, 16));
      }

      return bytes;
  }

  self.isArray = function(obj) {
      return !!(obj && obj.concat && obj.unshift && !obj.callee);
  }

  // converts array of bytes to hexadecimal chars
  self.codes2Str = function(byteArray) {
    return String.fromCharCode.apply(null, byteArray);
  }

  self.stringify = function(obj, replacer, spaces, cycleReplacer) {
    return JSON.stringify(obj, serializer(replacer, cycleReplacer), spaces)
  };

  self.serializer = serializer = function(replacer, cycleReplacer) {
    var stack = [], keys = []

    if (cycleReplacer == null) cycleReplacer = function(key, value) {
      if (stack[0] === value) return "[Circular ~]"
      return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]"
    }

    return function(key, value) {
      if (stack.length > 0) {
        var thisPos = stack.indexOf(this)
        ~thisPos ? stack.splice(thisPos + 1) : stack.push(this)
        ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key)
        if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value)
      }
      else stack.push(value)

      return replacer == null ? value : replacer.call(this, key, value)
    }
  };

  self.renderTemplate = function(templateSelector, opts) {
    var rowHtml = $(templateSelector).html();

    for (var prop in opts){
      var pattern = '{{\\s*' + prop + '\\s*}}';
      rowHtml = rowHtml.replace(new RegExp(pattern, 'g'), opts[prop]);
    }

    return rowHtml;
  };

  self.renderSpinner = function() {
    return $('<i />').addClass('fa fa-spin fa-spinner')
  };

  self.renderFA = function(klass) {
    return $('<i />').addClass('fa ' + klass);
  };

  self.debounce = function(debounce, debounceTime) {
    var dfd = $.Deferred();
    setTimeout(function() {
      debounce = !debounce;
      dfd.resolve(debounce);
    }, debounceTime || App.Constants.DEBOUNCE_TIMEOUT );
    return dfd.promise();
  };

  return App;
})(App || {});