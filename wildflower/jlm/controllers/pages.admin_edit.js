$.jlm.bind('pages.admin_index', function() {
    $('.panels').tabs();
});

$.jlm.bind('pages.admin_edit', function() {
   
   $('textarea:first').focus();
   
   var origText = $('a[href=#ShowSidebarEditor]').text();
   $('a[href=#ShowSidebarEditor]').toggle(function() {
       $('.sidebar_editor').slideDown(500, function() {
           $('.sidebar_editor textarea').focus();
       });
       $(this).text('<l18n>Hide sidebar editor</l18n>');
       return false;
   }, function() {
       $('.sidebar_editor').hide();
       $(this).text(origText);
       return false;
   });
});


$.jlm.bind('pages.admin_settings', function() {
	/*
	
    
	$.jlm.components.customFields.startup();

    $('.add', '#currentSettings').click(function(e)	{
		var token = $(this).attr('id');
		$.jlm.components.customFields.addCustom();
		e.preventDefault();
	});
    
	$('.add', '#availableSettings').click(function(e)	{
		var token = $(this).attr('id');
		var name = $(this).text();
		var type = 'text';
		$.jlm.components.customFields.add();
		e.preventDefault();
	});
    
	$('.edit', '#currentSettings').click(function(e)	{
		var token = $(this).attr('id');
		$.jlm.components.customFields.edit();
		e.preventDefault();
	});
    
	$('.save', '#currentSettings').click(function(e)	{
		var token = $(this).attr('id');
		$.jlm.components.customFields.save();
		e.preventDefault();
	});

    $('.cancel', '#currentSettings').click(function(e)	{
		var token = $(this).attr('id');
		$.jlm.components.customFields.cancel();
		e.preventDefault();
	});

    $('.delete', '#currentSettings').click(function(e)	{
		var token = $(this).attr('id');
		$.jlm.components.customFields.delete();
		
		e.preventDefault();
	});
	*/
});



$.jlm.bind('sidebars.admin_edit', function() {
    $('.panels').tabs();
});
