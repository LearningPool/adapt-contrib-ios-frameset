/**
    When Adapt content is viewed in a FRAME element, on iOS devices it is essential that the top frame contains
    the meta "viewport" element, otherwise the content will not scroll.
*/
$(function() {
    // Detect if we're in a FRAME or IFRAME
    if (window.frameElement && (window.frameElement.nodeName == "FRAME" || window.frameElement.nodeName == "IFRAME")) {

        if (!window.top.document.querySelector("meta[name=viewport]")) {
            $("head", window.top.document).append('<meta name="viewport" content="initial-scale=1.0, user-scalable=yes">');
        } else {
            $("meta[name='viewport']", window.top.document).attr("content", "initial-scale=1.0, user-scalable=yes");
        }

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
    }
});
