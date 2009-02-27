(function() {
	tinymce.create('tinymce.plugins.wfInsertLink', {

		init : function(ed, url) {
			var t = this;
            ed.addButton('wfinsertlink', {
	            title : 'Insert a Link',
	            onclick : function() {
	                 $.jlm.components.tinyMce.insertLink(ed);
	            },
	            'class' : 'mceIcon mce_image'
	        });
		}
		
	});

	tinymce.PluginManager.add('wfinsertlink', tinymce.plugins.wfInsertLink);
})();
