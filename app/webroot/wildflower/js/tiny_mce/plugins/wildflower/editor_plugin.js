(function() {
	
	// Load plugin specific language pack
	//tinymce.PluginManager.requireLangPack('example');

	tinymce.create('tinymce.plugins.wildflower', {

		init : function(ed, url) {
			var t = this;
			
			// Insert image button
            ed.addButton('wfinsertimage', {
	            title : 'Insert an image',
	            onclick : function() {
	                 $.jlm.components.tinyMce.insertImage(ed);
	            },
	            'class' : 'mceIcon mce_image'
	        });
	        
	        // Insert Widget button
	        ed.addButton('wfinsertwidget',  {
	            title : 'Insert a widget',
	            onclick : function() {
	                 $.jlm.components.tinyMce.insertWidget(ed);
	            },
	            'image' : $.jlm.base + '/wildflower/img/cog.png'
	        });

			//ed.addShortcut('ctrl+l', '??', 'wfinsertlink');
			//ed.addShortcut('ctrl+l', '??', 'wfinsertimage');
			//ed.addShortcut('ctrl+l', '??', 'wfinsertwidget');

	        // Insert Link button
	        ed.addButton('wfinsertlink',  {
	            title : 'Insert a Link to Content or resource',
	            onclick : function() {
					var se=ed.selection;
	                 $.jlm.components.tinyMce.insertLink(ed, se);
	            },
	            'class' : 'mceIcon mce_link'
	            //'image' : $.jlm.base + '/wildflower/img/page_link.png'
	        });
		},
	/**
	 * Returns information about the plugin as a name/value array.
	 * The current keys are longname, author, authorurl, infourl and version.
	 *
	 * @return {Object} Name/value array containing information about the plugin.
	 */
	getInfo : function() {
			return {
				longname : 'Wildflower Widgets',
				author : 'Róbert Starší & Sam Sherlock',
				authorurl : 'http://wf.klevo.sk',
				infourl : 'http://wf.klevo.sk',
				version : "0.1a"
			};
		}
		
	});

	tinymce.PluginManager.add('wildflower', tinymce.plugins.wildflower);
})();
