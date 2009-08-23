/*
 * jQuery Clickable Plugin
 * Copyright (c) 2008 Matt Curry
 * www.PseudoCoder.com
 * http://github.com/mcurry/jquery/tree/master/clickable
 * http://www.pseudocoder.com/archives/2008/10/21/clickable-box-with-jquery-part-2-the-plugin/
 *
 * @author      Matt Curry <matt@pseudocoder.com>
 * @license     MIT
 *
 */
 
(function($) {
  $.fn.clickable = function(options) {
    var opts = $.extend({}, $.fn.clickable.defaults, options);
	
		return this.each(function() {
      $(this).bind("click", function() {
        window.location = $(this).find(opts.link).attr("href");
      });
      
      $(this).hover(opts.hover, opts.unhover);
		});
  };
  
  $.fn.clickable.defaults = {
    link: "a:first",
		hover: function() {},
		unhover: function() {}
  };
})(jQuery);