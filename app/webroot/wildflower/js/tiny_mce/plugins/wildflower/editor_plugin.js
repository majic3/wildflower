(function() {
	
	// Load plugin specific language pack
	//tinymce.PluginManager.requireLangPack('example');

	tinymce.create('tinymce.plugins.wildflower', {

		init : function(ed, url) {
			var t = this;
			
			// Insert image button
			//ed.addButton('wfinsertimage', {});

			// Insert image button
			//ed.addButton('wfinsertgrid', {});
			
			// Insert Widget button
			//ed.addButton('wfinsertwidget',  {});
			
			ed.onDblClick.add(function(ed, e) {
				// here I want to check if the element is img.widget or img or noneditable block
				$.jlm.components.widgets.edit(e.target);
			});

			//ed.addShortcut('ctrl+l', '??', 'wfinsertlink');
			//ed.addShortcut('ctrl+l', '??', 'wfinsertimage');
			//ed.addShortcut('ctrl+l', '??', 'wfinsertwidget');

			// Insert Link button
			//ed.addButton('wfinsertlink',  );

			//ed.addButton('wfdivwrapper', );
		},

		createControl: function(n, cm) {
			var c = null;
			switch (n) {
				case 'wfmedia':
					c = cm.createSplitButton('wfmedia', {
						title : 'Insert Images',
						'class' : 'mceIcon mce_image'
					});

					c.onRenderMenu.add(function(c, m) {
						m.add({title : 'Images', 'class' : 'mceMenuItemTitle'}).setDisabled(1);

						m.add({
							title : 'Insert Image from Wildflower', 
							onclick : function() {
								console.info('Insert Image Clicked.');
								$.jlm.components.tinyMce.insertImage(ed);
							}, 
							'class' : 'mceIcon mce_image'
						});

						m.add({title : 'Insert Image Stored elsewhere', onclick : function() {
							alert('Insert External Image Clicked.');
						}});

						m.add({title : 'Insert swfObject', onclick : function() {
							alert('Insert swfObject.');
						}});
					});
				  // Return the new menubutton instance
				  return c;

				case 'wfmodules':
					c = cm.createSplitButton('wfmodules', {
						title : 'Manage Modules',
						'class' : 'mceIcon'
					});

					c.onRenderMenu.add(function(c, m) {
						m.add({title : 'Wildflower Modules', 'class' : 'mceMenuItemTitle'}).setDisabled(1);

						m.add({
							title : 'Insert Wildflower Widget', 
							image : $.jlm.base + '/wildflower/img/cog.png',
							onclick : function() {
								$.jlm.components.tinyMce.insertWidget(ed);
							}
						});

						m.add({
							title : 'Insert Wildflower Menu', 
							//image : $.jlm.base + '/wildflower/img/menu.png', 
							onclick : function() {
								console.info('Insert Wildflower Menu Clicked.');
								$.jlm.components.tinyMce.insertMenu(ed);
							}
						});

						m.add({
							title : 'Wrap content with a Division with a className of...',
							image : $.jlm.base + '/wildflower/img/wrap.png',
							onclick : function()	{
								//alert('Insert Wildflower Block Clicked.');
								console.info('Wrap Content Clicked.');
								var bespokeClass = window.prompt('Please enter the class name of wrapping node');
								ed.dom.setOuterHTML(ed.selection.getNode(),'<div class="'+bespokeClass+'">'+ed.dom.getOuterHTML(ed.selection.getNode())+'</div>');
							},
							//'class' : 'mceIcon'
						});

						m.add({
							title : 'Update Embedded Wildflower Blocks', 
							//image : $.jlm.base + '/wildflower/img/update.png',
							onclick : function() {
								console.info('Update Embedded Wildflower Blocks Clicked.');
							}
						});
					});
				  // Return the new menubutton instance
				  return c;

				case 'wflinks':
					c = cm.createSplitButton('wflinks', {
						title : 'Links insert, edit or remove',
						'class' : 'mceIcon mce_link'
					});

					c.onRenderMenu.add(function(c, m) {
						m.add({title : 'Links', 'class' : 'mceMenuItemTitle'}).setDisabled(1);

						m.add({
							title : 'Insert a Link to Content or resource',
							onclick : function() {
								var se=ed.selection;
								console.info('Insert Link Clicked.');
								$.jlm.components.tinyMce.insertLink(ed, se);
							},
							'class' : 'mceIcon mce_link'
							//'image' : $.jlm.base + '/wildflower/img/page_link.png'
						});

						m.add({
							title : 'Insert Link to Off Site Url', 
							onclick : function() {
								var se=ed.selection;
								console.info('Insert External Link Clicked.');
								$.jlm.components.tinyMce.insertRemoteLink(ed, se);
							},
							'class' : 'mceIcon mce_link'
						});

						m.add({
							title : 'Remove Link', 
							onclick : function() {
								var se=ed.selection;
								alert('Remove link clicked.');
							},
							'class' : 'mceIcon mce_unlink'
						});
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
