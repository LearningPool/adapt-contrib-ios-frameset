/**
	When Adapt content is viewed in a FRAME element, on iOS devices it is essential that the top frame contains
	the meta "viewport" element, otherwise the content will not scroll.
*/
$(function() {
	if (window.frameElement && window.frameElement.nodeName == "FRAME") {
		if (!window.top.document.querySelector("meta[name=viewport]")) {
			$("head", window.top.document).append('<meta name="viewport" content="initial-scale=1.0, user-scalable=yes">');
		} else {
			$("meta[name='viewport']", window.top.document).attr("content", "initial-scale=1.0, user-scalable=yes");
		}
	}
});