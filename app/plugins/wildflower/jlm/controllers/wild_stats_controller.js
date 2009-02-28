


// initial set up of password meter - used when adding user and when changing password
$.jlm.bind('wild_stats.wf_index', function() { 
    $('.list-of-stats li').click(function() {
		var $chk = $('input:checkbox', $(this));
		if($chk.attr('checked'))	{
			$chk.removeAttr('checked').parent().parent('li').removeClass('selected');
		} else {
			$chk.attr('checked', 'true').parent().parent('li').addClass('selected');
		}
    });
    // Double click on a post item takes you to the edit screen
    $('.list-of-stats li').dblclick(function() {
        var editUrl = $(this).find('a:first').attr('href');
        $.jlm.redirect(editUrl, false);
        return true;
    });
});