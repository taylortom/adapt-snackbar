// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var _ = require('underscore');
  var Origin = require('core/origin');
  
  var $el;
  var timer;
  var queue = [];

  var Snackbar = function(data) {
    if(typeof data === 'string') data = { text: data };
    // push to the queue, populating with defaults as we go
    queue.push(_.extend({}, {
      type: 'info',
      text: '',
      buttonText: Origin.l10n.t('app.snackbarclosebutton'),
      persist: false,
      animTime: 250,
      timeout: 3000,
      callback: null
    }, data));
    if(queue.length === 1) processQueue();
  };

  var render = function() {
    var template = Handlebars.templates['snackbar'];
    $('#app').prepend(template());
    $el = $('#snackbar');
    $el.fadeOut(0);
  };

  var processQueue = function() {
    var data = queue[0];

    $('.body', $el).text(data.text);
    $('.close a', $el).text(data.buttonText);

    if(data.persist === true) $('.close', $el).show();
    else $('.close', $el).hide();

    $el.removeClass().addClass(data.type).fadeIn(data.animTime);

    if(!data.persist) timer = setTimeout(closeSnack, data.timeout);
  };

  var closeSnack = function(event) {
    event && event.preventDefault();
    clearInterval(timer);
    var data = queue.shift();
    $el.fadeOut(defaults.animTime, function() {
      if(data.callback) data.callback.apply();
      if(queue.length > 0) processQueue();
    });
  };

  Origin.on('origin:dataReady', function() {
    Origin.Notify.register('snackbar', Snackbar);
    render();
    $('.close a', $el).click(closeSnack);

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
      Origin.Notify.snackbar(notifies[index]);
    });
  });
});
