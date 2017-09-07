/**
    When Adapt content is viewed in a FRAME element, on iOS devices it is essential that the top frame contains
    the meta "viewport" element, otherwise the content will not scroll.
*/
$(function() {
    // Detect if we're in a FRAME or IFRAME
    if (window.self !== window.top) {
        if (window.top && !$('html').hasClass('ie')) {
            try {
                if (!window.top.document.querySelector("meta[name=viewport]")) {
                    $("head", window.top.document).append('<meta name="viewport" content="initial-scale=1.0, user-scalable=yes">');
                } else {
                    $("meta[name='viewport']", window.top.document).attr("content", "initial-scale=1.0, user-scalable=yes");
                }
            } catch (e) {

            }
        }

        $('html').addClass('frameset');

        if ($('html').hasClass('touch')) {

            // Subsequent styling for body to enable scrolling
            $('body').css({
                'overflow-x': 'auto',
                'position': 'absolute',
                'top': '0',
                'left': '0',
                'height': '100%',
                'width': '100%'
            });
        }

        if ($('html').hasClass('trickle')) { // trickle styling in iframe/frameset

            // Subsequent styling for body to enable scrolling
            $('body').css({
                'height': 'auto',
                'min-height': '100vh',
            });
        }
    }
});

define(function(require) {

    var Adapt = require('coreJS/adapt');

    Adapt.on('pageView:ready', function(page) {
        // Fix for external media sources which use iFrames, e.g. Vimeo, YouTube.
        var $html = $('html');
        if ($html.hasClass("iphone") || $html.hasClass("ipad")) {
            _.each($(".media-widget.external-source.video-vimeo"), function(item) {
                var $item = $(item);
                var dataId = $item.find('.mejs-container').attr('id');
                var type = 'vimeo';

                // Add a <div> to allow scrolling.
                $item.find('.mejs-mediaelement').prepend('<div class="ios-media-scroller" data-id="' + dataId + '" data-type="' + type +'"></div>');

            });

            // iOS demands that the event handlers are bound individually.
            _.each($('div.ios-media-scroller'), function(div) {
                $(div).on('click', function(event) {
                    var id = event.currentTarget.dataset.id;
                    var type = event.currentTarget.dataset.type;

                    switch (type) {
                        case 'vimeo':
                            var player = $f($(event.currentTarget).siblings().find('iframe')[0]);
                            player.api("play");
                    }
                });
            });
        }
    });

});
