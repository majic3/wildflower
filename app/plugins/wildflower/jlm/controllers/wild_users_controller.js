$.fn.passwordStrength.defaults = {
	classes : Array('is10','is20','is30','is40','is50','is60','is70','is80','is90','is100'),
	targetDiv : '#passwordStrengthDiv',
	cache : {},
	generateCallback: uPassCallback
}

function uPassCallback(pass)	{
	console.info('uPassCallback 5-' + pass);
}


// initial set up of password meter - used when adding user and when changing password
$.jlm.bind('wild_users.wf_index, wild_users.wf_change_password', function() { 
    $('#WildUserPassword').passwordStrength();
});


// initial set up of password meter - used when adding user and when changing password
$.jlm.bind('wild_users.wf_index', function() { 
    // Double click on a post item takes you to the edit screen
    $('.list-of-users li').dblclick(function() {
        var editUrl = $(this).find('a:first').attr('href');
        $.jlm.redirect(editUrl, false);
        return true;
    });
});

$.jlm.bind('wild_users.wf_change_password', function() {

    $('form').clearForm();
	
});