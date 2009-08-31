// Scripts executed globaly or with more controllers

$.jlm.bind('app_controller.beforeFilter', function () {
    
    $.jlm.components.tinyMce.startup();

	// use another one that cabe applied to checkboxes only if overhead is low this idea may be ot get filament group custom inpputs working
	$('.switch').iphoneSwitch("off", 
		function() {
			alert("Ooo you're turning me on.");
		},
		function() {
			alert("Aw, you turned me off.");
		},{
			mouse_over: 'pointer',
			mouse_out:  'default',
			switch_on_container_path: '/wildflower/css/img/iphone_switch_container_on.png',
			switch_off_container_path: '/wildflower/css/img/iphone_switch_container_off.png',
			switch_path: '/wildflower/css/img/iphone_switch.png',
			switch_height: 27,
			switch_width: 94
		}
	);

	$('.submitBtn').hover(
		// mouseover
		function(){ $(this).addClass('submitBtnHover'); },
		
		// mouseout
		function(){ $(this).removeClass('submitBtnHover'); }
	);

	// clear a short
	$('.clearshort').click(function(event)	{
		//console.info("clearing short: " + this.href);
		$.post(this.href, 
		function(data){
			$('.cancel-short').fadeOut('fast');
			$('.short-url').fadeOut('fast');
			$('.horizontal-form-buttons').html('<div class="submit save-section"><input type="submit" value="set short" /></div>');
		}, "json");
		event.preventDefault();
	});

	// might move this later after reorganising jlm - names don't really matter but want to use a logical break down, jlm might be finished
	$('.fulleditor').toggle(function (event)	{
		$('body').toggleClass('full');
		$('.fulleditor').html('exit');
	}, function (event)	{
		$('body').toggleClass('full');
		$('.fulleditor').html('full');
	})
});
