// Scripts executed globaly or with more controllers

$.jlm.bind('app_controller.beforeFilter', function () {
    //	the majic branch of wf will retain tiny mce
	$.jlm.components.tinyMce.startup();	 

	$('.tabs').tabs();

});
