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

$.jlm.bind('wild_pages.wf_about', function() {

});

$.jlm.bind('wild_pages.wf_jqueryui', function() {


				// Accordion
				$("#accordion").accordion({ header: "h3" });
	
				// Tabs
				$('#tabs').tabs();
	

				// Dialog			
				$('#dialog').dialog({
					autoOpen: false,
					width: 600,
					buttons: {
						"Ok": function() { 
							$(this).dialog("close"); 
						}, 
						"Cancel": function() { 
							$(this).dialog("close"); 
						} 
					}
				});
				
				// Dialog Link
				$('#dialog_link').click(function(){
					$('#dialog').dialog('open');
					return false;
				});

				// Datepicker
				$('#datepicker').datepicker({
					inline: true
				});
				
				// Slider
				$('#slider').slider({
					range: true,
					values: [17, 67]
				});
				
				// Progressbar
				$("#progressbar").progressbar({
					value: 20 
				});
				
				//hover states on the static widgets
				$('#dialog_link, ul#icons li').hover(
					function() { $(this).addClass('ui-state-hover'); }, 
					function() { $(this).removeClass('ui-state-hover'); }
				);

});