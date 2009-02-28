


// initial set up of password meter - used when adding user and when changing password
$.jlm.bind('wild_links.wf_index', function() { 
	// this could be made reusable - forgive me I am tired
    $('.list-of-links li').click(function() {
		var $chk = $('input:checkbox', $(this));
		if($chk.attr('checked'))	{
			$chk.removeAttr('checked').parent().parent('li').removeClass('selected');
		} else {
			$chk.attr('checked', 'true').parent().parent('li').addClass('selected');
		}
    });

    // Double click on a post item takes you to the edit screen
    $('.list-of-links li').dblclick(function() {
        var editUrl = $(this).find('a:first').attr('href');
        $.jlm.redirect(editUrl, false);
        return true;
    });
});