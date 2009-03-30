function init()	{
	$('a[title]').tipsy({fade: true, gravity: 'n'})
		$('#body .tabs').tabs();
	///$('.accordion').accordion();
	if(hasFeeds)	{
		$('a.feed').gFeed( { target: '#feeds', tabs: true } );
	}

}

this.label2value = function(){	

	var inactive = "inactive";
	var active = "active";
	var focused = "focused";
	
	$("label").each(function(){		
		obj = document.getElementById($(this).attr("for"));
		if(($(obj).attr("type") == "text") || (obj.tagName.toLowerCase() == "textarea"))	{
			$(obj).addClass(inactive);
			var text = $(this).text();
			$(this).css("display","none");
			$(obj).val(text);
			$(obj).focus(function(){	
				$(this).addClass(focused);
				$(this).removeClass(inactive);
				$(this).removeClass(active);
				if($(this).val() == text) $(this).val("");
			});	
			$(obj).blur(function(){	
				$(this).removeClass(focused);
				if($(this).val() == "") {
					$(this).val(text);
					$(this).addClass(inactive);
				} else {
					$(this).addClass(active);
				};
			});
		};
	});
};

$(document).ready(function (){
	label2value();
	$('#body .tabs').tabs();
	$('#body .tabs').live("initUI", function()	{
		$(this).tabs();
	});

	init();	
});