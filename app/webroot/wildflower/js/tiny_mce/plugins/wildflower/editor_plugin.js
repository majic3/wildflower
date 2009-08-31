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

			// Insert image button
			ed.addButton('wfinsertgrid', {
				title : 'Insert a CSS Based Grid',
				onclick : function() {
					 $.jlm.components.tinyMce.insertGrid(ed);
				},
				'class' : 'mceIcon'
			});
			
			// Insert Widget button
			ed.addButton('wfinsertwidget',  {
				title : 'Insert a widget',
				onclick : function() {
					 $.jlm.components.tinyMce.insertWidget(ed);
				},
				'image' : $.jlm.base + '/wildflower/img/cog.png'
			});
			
			ed.onDblClick.add(function(ed, e) {
				// here I want to check if the element is img.widget or img or noneditable block
				$.jlm.components.widgets.edit(e.target);
			});
			
			// Insert Widget button
			ed.addButton('wfinserteblock',  {
				title : 'Insert a Editable Block',
				onclick : function() {
					 $.jlm.components.tinyMce.insertEblock(ed);
				},
				'image' : $.jlm.base + '/wildflower/img/eblock.png'
			});
			
			ed.onDblClick.add(function(ed, e) {
				$.jlm.components.widgets.edit(e.target);
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

			ed.addButton('wfdivwrapper', {
				title : 'Wrap Selected Content with a div of choosen class name',
				image : $.jlm.base + '/wildflower/img/wrap.png',
				onclick : function()	{
					var bespokeClass = window.prompt('Please enter the class name of wrapping node');
					ed.dom.setOuterHTML(ed.selection.getNode(),
						'<div class="'+bespokeClass+'">'+ed.dom.getOuterHTML(ed.selection.getNode())+'</div>'
					);
				},
	            //'class' : 'mceIcon'
			});
		},

		createControl: function(n, cm) {
			switch (n) {
				case 'wfmedia':
					var c = cm.createSplitButton('wfinsertimage', {
						title : 'Insert Images',
						'class' : 'mceIcon mce_image'
					});

					c.onRenderMenu.add(function(c, m) {
						m.add({title : 'Images', 'class' : 'mceMenuItemTitle'}).setDisabled(1);

						m.add({title : 'Insert Image from Wildflower', onclick : function() {
							alert('Insert Image Clicked.');
						}});

						m.add({title : 'Insert Image Stored elsewhere', onclick : function() {
							alert('Insert External Image Clicked.');
						}});

						m.add({title : 'Insert swfObject', onclick : function() {
							alert('Insert swfObject.');
						}});
				  });

				  // Return the new menubutton instance
				  return c;
				break;

				case 'wfmodules':
					var c = cm.createSplitButton('wfmmodules', {
						title : 'Manage Modules',
						'class' : 'mceIcon'
					});

					c.onRenderMenu.add(function(c, m) {
						m.add({title : 'Wildflower Modules', 'class' : 'mceMenuItemTitle'}).setDisabled(1);

						m.add({title : 'Insert Wildflower Widget', onclick : function() {
							alert('Insert Wildflower Widget Clicked.');
						}});

						m.add({title : 'Insert Wildflower Menu', onclick : function() {
							alert('Insert Wildflower Menu Clicked.');
						}});

						m.add({title : 'Insert Wildflower Block', onclick : function() {
							alert('Insert Wildflower Block Clicked.');
						}});

						m.add({title : 'Update Embedded Wildflower Blocks', onclick : function() {
							alert('Update Embedded Wildflower Blocks Clicked.');
						}});
				  });

				  // Return the new menubutton instance
				  return c;
				break;

				case 'wflinks':
					var c = cm.createSplitButton('wfinsertlink', {
						title : 'Links insert, edit or remove',
						'class' : 'mceIcon mce_link'
					});

					c.onRenderMenu.add(function(c, m) {
						m.add({title : 'Links', 'class' : 'mceMenuItemTitle'}).setDisabled(1);

						m.add({title : 'Insert Link to Wildflower Page/Post/Category', onclick : function() {
							alert('Insert Link Clicked.');
						}});

						m.add({title : 'Insert Link to External Thingy', onclick : function() {
							alert('Insert External Link Clicked.');
						}});

						m.add({title : 'Remove Link', onclick : function() {
							alert('Remove link clicked.');
						}});
				  });

				  // Return the new menubutton instance
				  return c;
				break;

				case 'wfgrids':
					var c = cm.createSplitButton('wfcssgrids', {
						title : 'Insert & Edit CSS Grids',
						'class' : 'mceIcon'
					});

					c.onRenderMenu.add(function(c, m) {
						m.add({title : 'Insert Grids', 'class' : 'mceMenuItemTitle'}).setDisabled(1);

						m.add({title : 'Insert Grid 1', onclick : function() {
							alert('Insert Grid 1 Clicked.');
						}});

						m.add({title : 'Insert Grid 2', onclick : function() {
							alert('Insert Grid 2 Clicked.');
						}});

						m.add({title : 'Insert Grid 3', onclick : function() {
							alert('Insert Grid 3 clicked.');
						}});
				  });

				  // Return the new menubutton instance
				  return c;
				break;
			}

			return null;
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
