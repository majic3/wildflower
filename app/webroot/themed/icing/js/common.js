function jLinkCall(e, a, o)	{
	var jUrl = null, jArgs = null, obTitle = '', rel;
		var regex = '\/(home|about|posts|gallery|contact)(.*)';

		if($(o).attr('title'))
				obTitle = $(o).attr('title');
		jUrl = $(o).attr('href'); 
		rel = $(o).attr('rel'); 
		var viewURL = jUrl.toString(), dataURL = "", params = {}, re = new RegExp(regex, "g"), addOn = []; 
		var shortcut = re.exec(viewURL);
		regex = '\/([0-9a-zA-Z-]*)';
		var PageClassName = $('body').attr('class');
		re = new RegExp(regex, "g");
		addOn = re.exec(shortcut[2]);

		
		// block with growl
		//$('#body').growlUI('Growl Notification', 'Have a nice day!');
		$('#body').block({  
                message: '<img src="/img/2-0.gif" />',  
                css: { border: '1px solid #FFF; background: #FFF;' }});
		var $height = $('#body').height();
		// convert the html url to json url	
		dataURL = siteCfg.path + shortcut[1] + '.json';
		$('#body').slideUp({ duration: 1000, easing: 'linear', complete: function()	{
			$('body').removeClass(PageClassName).addClass(shortcut[1]);
		}});
		$.post(dataURL, null, jLinkComplete, "json");


}
function jLinkComplete(data, status)	{
		// process the json object then int
		$('#body').html(data.contentStr).slideDown({ duration: 1000, easing: 'linear', complete: function()	{
			init();
		}});
		$.growlUI('loaded', data.titleStr);
}
function init()	{
	Shadowbox.setup();
	$('a[title]').tipsy({fade: true, gravity: 'n'})
		$('#body .tabs').tabs();
	$('.jScrollPane').jScrollPane();
	///$('.accordion').accordion();
	$('#body').unblock();
	$('a.feed').gFeed( { target: '#feeds', tabs: true } );

}

/**/

$(document).ready(function (){

	$('.jlink, .tabs li a').live('click', function(event, args)	{
		//jLinkCall(event, args, this);
		//event.preventDefault();
		//event.stopPropagation();
		//return false;
	});

	$('#body .tabs').tabs();
	$('#body .tabs').live("initUI", function()	{
		$(this).tabs();
	});

	init();

});