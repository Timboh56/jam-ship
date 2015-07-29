$(function() {
  var helmetOn = true;
  $('.spaceMonkey').velocity({ opacity: 1 }, 1000);
  setInterval((function() {
    if (helmetOn)
      $('.helmet').velocity({ fillOpacity: '0.3', fill: '#2980b9', stroke: '#000000'});
    else
      $('.helmet').velocity({ fillOpacity: '0.1', fill: '#ffffee', stroke: '#000000'});
    helmetOn = !helmetOn;
  }).bind(this), 3150)
  $('#helmet')
});