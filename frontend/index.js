// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var _ = require('underscore');
  var Origin = require('core/origin');
  // the below are overridden by any values passed to Snackbar
  var defaults = {
    type: 'info',
    text: '',
    // TODO localise
    buttonText: 'Click to dismiss',
    persist: false,
    animTime: 250,
    timeout: 3000,
    callback: null
  };
  var $el;
  var timer;
  var queue = [];

  var Snackbar = function(data) {
    if(typeof data === 'string') data = { text: data };
    queue.push(_.extend({}, defaults, data));
    if(queue.length === 1) processQueue();
  };

  var processQueue = function() {
    var data = queue[0];

    $('.body', $el).text(data.text);
    $('.close a', $el).text(data.buttonText);
    if(data.persist === true) $('.close', $el).show();
    else $('.close', $el).hide();

    $el.removeClass().addClass(data.type).fadeIn(data.animTime);
    // shuntUI($el.innerHeight());

    if(!data.persist) timer = setTimeout(closeSnack, data.timeout);
  };

  var closeSnack = function(event) {
    event && event.preventDefault();
    clearInterval(timer);
    var data = queue.shift();
    $el.fadeOut(defaults.animTime, function() {
      if(data.callback) data.callback.apply();
      // shuntUI($el.innerHeight()*-1);
      if(queue.length > 0) processQueue();
    });
  };

  // HACK the core LESS should accommodate this
  var shuntUI = function(amount) {
    var removePx = function(value) { return parseInt(value.replace('px','')); };
    $('.sidebar').css('top', removePx($('.sidebar').css('top')) + amount);
    $('#app').css('margin-top', removePx($('#app').css('margin-top')) + amount);
    $('#app').css('height', removePx($('#app').css('height')) + (amount * -1));
    Origin.trigger('window:resize');
  };

  Origin.on('origin:dataReady', function() {
    Origin.Notify.register('snackbar', Snackbar);
    var template = Handlebars.templates['snackbar'];
    setTimeout(function() {
      $('#app').prepend(template());
      $el = $('#snackbar');
      $el.fadeOut(0)
      $('.close a', $el).click(closeSnack);
    }, 100);
    // TODO examples, remove later
    $('body').append('<button class="btn btn-primary notify-me" style="width:185px; position:fixed; z-index:1000; bottom:15px; left:15px">Notify Me!</button>');
    $('button.notify-me').click(function() {
      var notifies = [
        "Just a string!",
        {
          type: "error",
          text: "Uh-oh, something bad has happened :("
        },
        {
          type: "alert",
          text: "Hello Tom, my name is HAL",
          buttonText: "Say hello",
          persist: true
        },
        {
          type: "info",
          text: "Today is " + new Date().toDateString()
        }
      ];
      var index = Math.floor(Math.random()*notifies.length);
      Snackbar(notifies[index]);
    });
  });
});
