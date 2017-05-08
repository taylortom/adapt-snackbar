// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var _ = require('underscore');
  var Origin = require('core/origin');

  var $el;
  var timer;
  var queue = [];
  var defaults;

  var Snackbar = function(data) {
    if(typeof data === 'string') data = { text: data };
    // push to the queue, populating with defaults as we go
    queue.push(_.extend({}, defaults, data));
    if(queue.length === 1) processQueue();
  };

  var setDefaults = function() {
    defaults = {
      type: 'info',
      text: '',
      buttonText: Origin.l10n.t('app.snackbarclosebutton'),
      persist: false,
      animTime: 250,
      timeout: 3000,
      callback: null
    };
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
    setDefaults();
    Origin.Notify.register('snackbar', Snackbar);
    render();
    $('.close a', $el).click(closeSnack);
  });
});
