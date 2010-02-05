$.jlm.bind('assets.admin_index', function() {
	
    // seems fixed to comments but would like to titel in place - $.jlm.components.inplaceEdit.startup();

	$.jlm.components.imagePreview.startup();

	// listNav
	$('#assetList').listnav({ 
		includeNums: false 
	});

	// #content_pad select change - to control the number of files displayed
	$('#content_pad select').live('change', function() {
		var sel = $(this);
		if(sel.val() != '')	{
			sel.parent('form').trigger('submit');	
		}

		return false;
	});

	/* / edit for more than title
	$('#assetList li').find('.edit').live('click', function (event)	{
		console.info('edit');
		event.preventDefault();
	}); */

	// edit in place for asset titles
	$('#assetList').find('li').live('dblclick', function (event)	{
		console.info('edit title');
	});
});

$.jlm.bind('posts.admin_edit, pages.admin_edit, sidebars.admin_edit', function() {
	
    // seems fixed to comments but would like to titel in place - $.jlm.components.inplaceEdit.startup();

	// double collapse menu
	$("#asset-browser > li > a[class=expanded]").live().find("+ ul").fadeIn("normal");
	$("#asset-browser > li > a").click(function() {
		var el = $(this).find("+ ul");

		if($(this).hasClass("collapsed"))
			$(el).fadeIn('normal');
		else
			$(el).fadeOut('normal');

		$(this).toggleClass("expanded").toggleClass("collapsed");
	});


	//*/


});