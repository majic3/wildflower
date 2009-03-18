
$.jlm.bind('wild_assets.wf_index', function() {
	// should this be chained? perhaps
    $('.list-of-assets li, .file-list li').click(function() {
		var $chk = $('input:checkbox', $(this));
		if($chk.attr('checked'))	{
			$chk.removeAttr('checked').parent().parent('li').removeClass('selected');
		} else {
			$chk.attr('checked', 'true').parent().parent('li').addClass('selected');
		}
    });
    
    // Double click on a post item takes you to the edit screen
    $('.list-of-assets li, .file-list li').dblclick(function() {
        var editUrl = $(this).find('a:first').attr('href');
        $.jlm.redirect(editUrl, false);
        return true;
    });
    
});