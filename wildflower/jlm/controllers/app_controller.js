// Scripts executed globaly or with more controllers

$.jlm.bind('app_controller.beforeFilter', function () {
    
    $.jlm.components.tinyMce.startup();

	$('a.remove').click(function() {
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
