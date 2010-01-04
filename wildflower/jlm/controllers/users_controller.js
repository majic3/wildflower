$.jlm.bind('users.admin_change_password, users.admin_index', function() {

	$.fn.passwordStrength.defaults = {
		classes : Array('is10','is20','is30','is40','is50','is60','is70','is80','is90','is100'),
		targetDiv : '#passwordStrengthDiv',
		cache : {}
	}
	
	$('#UserPassword').passwordStrength({targetDiv: '#passwordStrength',classes : Array('is10','is20','is30','is40')});	
    $('form').clearForm();
	
});
