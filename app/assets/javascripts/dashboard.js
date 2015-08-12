
$(document).on('click', '#show-create-channel-form', function() {
  $('.js-toggle').toggleClass('in');
  $('.new-channel-modal').modal('show');
  $(this).toggleClass('active');
});
