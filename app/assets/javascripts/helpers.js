function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function displayChatMessage(name, text) {
  $('<div/>').text(text).prepend($('<em/>').text(name+': ')).appendTo($('#messagesDiv'));
  $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
};

function getChar(event) {
  return String.fromCharCode(event.keyCode || event.charCode).toUpperCase();
}

function applyProperties(src, dest) {
  for (var prop in src) dest[prop] = src[prop];
  return dest;
}

function stringify(obj, replacer, spaces, cycleReplacer) {
  return JSON.stringify(obj, serializer(replacer, cycleReplacer), spaces)
}

function serializer(replacer, cycleReplacer) {
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
}

function renderTemplate(templateSelector, opts) {
  var rowHtml = $(templateSelector).html();

  for (var prop in opts){
    var pattern = '{{\\s*' + prop + '\\s*}}';
    rowHtml = rowHtml.replace(new RegExp(pattern, 'g'), opts[prop]);
  }

  return rowHtml;
}

function renderSpinner() {
  return $('<i />').addClass('fa fa-spin fa-spinner')
}