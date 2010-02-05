$.jlm.bind('comments.admin_index, comments.admin_spam', function () {
    
    $.jlm.components.inplaceEdit.startup();

	// double click list item to edit the item inplace - clicking on para can be difficult
	//$('.comments-list').find('li').live('dblclick', function (event)	{
	//	$(this).find('.inplace-edit').trigger('dblclick');
	//});
    
});