// Scripts executed globaly or with more controllers

$.jlm.bind('app_controller.beforeFilter', function () {
    
    $.jlm.components.tinyMce.startup();

	$('a.remove').live('click', function() {
		if (confirm("Are you sure you want to remove this item?")) {
			return true;
		}
		return false;
	});

	$('.submitBtn').hover(
		// mouseover
		function(){ $(this).addClass('submitBtnHover'); },
		
		// mouseout
		function(){ $(this).removeClass('submitBtnHover'); }
	);

	// clear a short
	$('.clearshort').live('click', function(event)	{
		//console.info("clearing short: " + this.href);
		$.post(this.href, 
		function(data){
			$('.cancel-short').fadeOut('fast');
			$('.short-url').fadeOut('fast');
			$('.horizontal-form-buttons').html('<div class="submit save-section"><input type="submit" value="set short" /></div>');
		}, "json");
		event.preventDefault();
	});

	// area toogle - sweet simple & has many advantages
	/*
		~ we have enough mana to cast many spells ~ 
		live is better than bind --- or so I have heard (poss Paul Irish) - its worth checking
		I think all these anon funcs are busted and should be resolved.
	*/
	$('#header').find('.areaToggle').live('click', function () {
		$('body').toggleClass('full');
		$(this).html('Exit').attr('title', 'Click to return to full display', '');
	}, function (event)	{
		$('body').toggleClass('full');
		$(this).html('Full').attr('title', 'Click to maximise display area');
	});

	$('#sysMsg .dismiss').live('click', function(e) {

		var sysMsgs = $(this).parent('p').fadeOut('fast').remove().parent('div');
			console.info('sysMsgs: ' + sysMsgs);

		if(sysMsgs.html() == '')	{
			console.info('is empty');
			sysMsgs.removeClass('display');
		}

		e.preventDefault();

	});

	$('#sysMsg').html('<p class="notice">updater 50 using live more now is this better</p> ');

	// fade out messages (notice & success) after 8 seconds  
	$('.notice, .success').animate({opacity: 1.0}, 8000).fadeOut(); 

	// want to make a way to load some extra js eg date.js but only when required -- labJS but how best to fit it in.
	// make a jlm comp -- so that devs can easily set the views/actions that call these additional scripts are called on
	// like the select actions comp use addComp
});


$.jlm.bind('pages.admin_edit, posts.admin_edit, pages.admin_options, pages.admin_sidebar, posts.admin_options, posts.admin_categorize, posts.admin_comments, posts.admin_sidebar, sidebars.admin_edit', function() {
	$.jlm.components.jumpMenu.startup();
});