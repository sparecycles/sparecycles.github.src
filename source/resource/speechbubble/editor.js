jQuery(function($) {
  var tool;
  function serialize() {
    var data = {};
    data.picture = $('.picture').attr('src');
    data.bubbles = [];
    $('.picture-container .bubble').each(function() {
      var bubble = {};
      bubble.type = $(this).attr('data-type');
      bubble.left  = $(this).css('left');
      bubble.top = $(this).css('top');
      bubble.text = $('.text', this).text();
      data.bubbles.push(bubble);
    });
    var encoded = Object.keys(data).map(function(key) {
      return [key, JSON.stringify(data[key])].map(encodeURIComponent).join('=');
    }).join('&');
    window.history.replaceState(null, '', '?' + encoded);
  }
  function deserialize(thedata) {
    var data = {};
    thedata.split('&').map(function(kv) {
      kv = kv.split('=').map(decodeURIComponent);
      data[kv[0]] = JSON.parse(kv[1]);
    });
    return data;
  }
  window.onpopstate = function() {
    if(!window.location.search) return;
    var data = deserialize(window.location.search.slice(1));
    $('.picture-container .bubble').remove();
    $('.picture').attr('src', data.picture);
    data.bubbles.forEach(function(bubble) {
      say(bubble.left, bubble.top, bubble.text, bubble.type);
    });
  }
  $('.toolbar img.tool').click(function() {
    $('.toolbar img.tool').removeClass('selected');
    $(this).addClass('selected');
    tool = $(this).attr('id');
  });
  $('#speech').click();

  $('.toolbar img#load').click(function() {
    $('.picture').attr('src', prompt("gimme picture"));
    $('.picture-container .bubble').remove();
    serialize();
  });

  function say(x, y, what, template) {
    if(!what) return;
    var $speech = $('#' + template + '-template').contents().clone();
    $('.text', $speech).text(what);
    $speech.css({left: x, top: y});
    $speech.insertAfter('.picture');
    serialize();
  }
  $('.bubble').live('click', function() {
    if(tool === 'delete') {
      $(this).remove();
    }
    serialize();
  });
  $('.picture').click(function(event) {
    switch(tool) {
    case 'speech':
      say(event.offsetX, event.offsetY, prompt("say what?"), 'speech');
      break;
    case 'thought':
      say(event.offsetX, event.offsetY, prompt("think what?"), 'thought');
      break;
    }
  });
});
