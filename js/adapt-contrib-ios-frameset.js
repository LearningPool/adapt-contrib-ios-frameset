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
                // A security error should not interrupt the rest of the script.
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

define([
    'core/js/adapt'
], function(Adapt) {

    if (window.frameElement && window.frameElement.nodeName == "IFRAME") {
        // Check if IOS specific IFRAME handling is required.
        if (Adapt.device.OS == 'ios' && window.frameElement && window.frameElement.nodeName == "IFRAME") {
            Adapt.on("app:dataReady", function() {
                // Fix for iOS fixed position elements/Trickle.
                $("html").addClass("ios-scroll-fix");

                // Make fake HTML and BODY tags.
                var $scrollingContainer = $('<div class="scrolling-container"><div class="scrolling-inner body"></div></div>');
                var $scrollingInner = $scrollingContainer.find(".scrolling-inner");
                
                $("body").append($scrollingContainer);

                //move wrapper inside fake tags
                $("#wrapper").appendTo($scrollingInner);
                
                // Fix scrolling.
                var originalElementScrollTo = $.fn.scrollTo;

                $.fn.scrollTo = function(target, duration, settings) {
                    if (this[0] === window || this[0] === document.body) {
                        return originalElementScrollTo.apply($(".scrolling-container"), arguments);
                    } else {
                        return originalElementScrollTo.apply(this, arguments);
                    }
                };

                var originalScrollTo = $.scrollTo;

                $.scrollTo = function(target, duration, settings) {
                    return originalElementScrollTo.apply($(".scrolling-container"), arguments);
                };

                var originalScrollTop = $.fn.scrollTop;

                $.fn.scrollTop = function() {
                    if (this[0] === window || this[0] === document.body) {
                        return originalScrollTop.apply($(".scrolling-container"), arguments);
                    } else {
                        return originalScrollTop.apply(this, arguments);
                    }
                };

                window.scrollTo = function(x,y) {
                    $(".scrolling-container")[0].scrollTop = y || 0;
                    $(".scrolling-container")[0].scrollLeft = x || 0;
                };

                $(".scrolling-container").on("scroll", function() {
                    $(window).scroll();
                });

                // Fix JQuery offset.
                var jqueryOffset = $.fn.offset;

                $.fn.offset = function() {
                    var offset = jqueryOffset.call(this);
                    var $stack = this.parents().add(this);
                    var $scrollParents = $stack.filter(".scrolling-container");
                    $scrollParents.each(function(index, item) {
                        var $item = $(item);
                        var scrolltop = parseInt($item.scrollTop());
                        var scrollleft = parseInt($item.scrollLeft());
                    
                        offset.top += scrolltop;
                        offset.left += scrollleft;
                    });

                    return offset;
                };
                
                // Move navigation to outside the scrolling area.
                var $navigationContainer = $('<div class="navigation-container"></div>');
                $("body").prepend($navigationContainer);

                Adapt.once("adapt:initialize", function() {
                    $(".navigation").prependTo($navigationContainer);
                });
            });
        } else if (Adapt.device.OS == 'android') {
             // Fix for Android fixed position elements/Trickle.
            $("html").addClass("android-scroll-fix");
        }
    }
    
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
