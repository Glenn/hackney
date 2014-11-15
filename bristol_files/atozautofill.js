(function ($) {

/**
 * Automatically fill AtoZ first textbox from menu link title.
 */
 
	Drupal.behaviors.pageAZFieldAutoFill = {
		attach:function(context) {
		var $link_title_atoz = $('#edit-title', context);
		var $atoz_title_1 = $('#edit-field-glossary-und-0-value', context);
		
		$link_title_atoz.keyup(function () {
			$atoz_title_1.val($link_title_atoz.val());
		  });  
		}	
	};
})(jQuery);