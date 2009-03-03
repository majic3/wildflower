$.jlm.bind('wild_pages.wf_edit', function() {		  

	var edHeight = $('.editor').parent().css('height');

	$('textarea:first').focus();

	var origText = $('a[href=#ShowSidebarEditor]').text();
		$('a[href=#ShowSidebarEditor]').toggle(function() {
			$('.editor').slideUp(300);
			$('.sidebar_editor').slideDown(500, function() {
			$.jlm.components.tinyMce.resizeToFillScreen($("WildPageContent"));
			$('.sidebar_editor textarea').focus();
		});
		$(this).text('<l18n>Hide sidebar editor</l18n>');
		return false;
	}, function() {
		$('.sidebar_editor').hide();	
		$('.editor').slideDown(500);
		$.jlm.components.tinyMce.resizeToFillScreen($("WildPageSidebarContent"));
		$(this).text(origText);
		return false;
	});

});