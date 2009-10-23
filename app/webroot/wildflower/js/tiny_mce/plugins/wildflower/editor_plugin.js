(function() {
	
	// Load plugin specific language pack
	//tinymce.PluginManager.requireLangPack('example');

	tinymce.create('tinymce.plugins.wildflower', {

		init : function(ed, url) {
			var t = this;
			
			ed.onDblClick.add(function(ed, e) {
				// here I want to check if the element is img.widget or img or noneditable block
				$.jlm.components.widgets.edit(e.target);
			});
		},

		createControl: function(n, cm) {
			var c = null;

			switch (n) {
				case 'wfmedia':
					c = cm.createSplitButton('wfmedia', {
						title : 'Insert Media',
						image : $.jlm.base + '/wildflower/img/icons/images.png',
						onclick : function() {
							//	console.info(ed);
							$.jlm.components.tinyMce.insertImage();
						}
					});

					c.onRenderMenu.add(function(c, m) {
						m.add({
							title : 'Images', 
							'class' : 'mceMenuItemTitle mce_image'
						}).setDisabled(1);

						m.add({
							title : '<img src="'+$.jlm.base + '/wildflower/img/icons/image.png" class="mceIcon" />' + 'Insert Image from Wildflower', 
							onclick : function() {
								//	console.info(ed);
								$.jlm.components.tinyMce.insertImage();
							}
						});

						m.add({
							title : '<img src="'+$.jlm.base + '/wildflower/img/icons/flash.png" class="mceIcon" />' + 'Insert swfObject', 
							onclick : function() {
								var Params = {};
								console.info('Insert swfObject.');
								$.jlm.components.tinyMce.insertModule('swf', Params);
							}
						});
					});
				  // Return the new menubutton instance
				  return c;

				case 'wfmodules':
					c = cm.createSplitButton('wfmodules', {
						title : 'Manage Modules',
						'class' : 'mceIcon',
						image : $.jlm.base + '/wildflower/img/icons/bricks.png', 
						onclick : function() {
							$.jlm.components.tinyMce.insertWidget();
						}
					});

					c.onRenderMenu.add(function(c, m) {
						m.add({title : 'Wildflower Modules', 'class' : 'mceMenuItemTitle'}).setDisabled(1);

						m.add({
							title : '<img src="'+$.jlm.base + '/wildflower/img/icons/cog.png" class="mceIcon" />' + 'Insert Wildflower Widget', 
							onclick : function() {
								$.jlm.components.tinyMce.insertWidget();
							}
						});

						m.add({
							title : '<img src="'+$.jlm.base + '/wildflower/img/icons/link_go.png" class="mceIcon" />' + 'Insert Wildflower Menu', 
							//image : $.jlm.base + '/wildflower/img/icons/menu.png', 
							onclick : function() {
								console.info('Insert Wildflower Menu Clicked.');
								//$.jlm.components.tinyMce.insertMenu(ed);
							}

						});

						m.add({
							title : '<img src="'+$.jlm.base + '/wildflower/img/icons/wrap.png" class="mceIcon" />' + 'Wrap content with a Division with a className of...',
							//image : $.jlm.base + '/wildflower/img/wrap.png',
							onclick : function()	{
								//alert('Insert Wildflower Block Clicked.');
								console.info('Wrap Content Clicked.');
								$.jlm.components.tinyMce.wrap();
								//var bespokeClass = window.prompt('Please enter the class name of wrapping node');
								//ed.dom.setOuterHTML(ed.selection.getNode(),'<div class="'+bespokeClass+'">'+ed.dom.getOuterHTML(ed.selection.getNode())+'</div>');
							}

							//'class' : 'mceIcon'
						});

						m.add({
							title : 'Unwrap content with a Division with a className of...',
							//image : $.jlm.base + '/wildflower/img/wrap.png',
							onclick : function()	{
								//alert('Insert Wildflower Block Clicked.');
								console.info('Wrap Content Clicked.');
								$.jlm.components.tinyMce.unwrap();
								//var bespokeClass = window.prompt('Please enter the class name of wrapping node');
								//ed.dom.setOuterHTML(ed.selection.getNode(),'<div class="'+bespokeClass+'">'+ed.dom.getOuterHTML(ed.selection.getNode())+'</div>');
							}

							//'class' : 'mceIcon'
						});

						m.add({
							title : '<img src="'+$.jlm.base + '/wildflower/img/icons/brick_add.png" class="mceIcon" />' + 'Update Embedded Wildflower Blocks', 
							//image : $.jlm.base + '/wildflower/img/update.png',
							onclick : function() {
								console.info('Embed Wildflower Block Clicked.');
								$.jlm.components.tinyMce.insertBlock();
							}

						});

						m.add({
							title : '<img src="'+$.jlm.base + '/wildflower/img/icons/bricks.png" class="mceIcon" />' + 'Update Embedded Wildflower Blocks', 
							//image : $.jlm.base + '/wildflower/img/update.png',
							onclick : function() {
								console.info('Update Embedded Wildflower Blocks Clicked.');
								$.jlm.components.tinyMce.updateBlock();
							}

						});

						m.add({
							title : 'Hoax', 
							onclick : function() {
								console.info('Hoax.');
								$.jlm.components.tinyMce.hoax();
							}

						});
					});
				  // Return the new menubutton instance
				  return c;

				case 'wflinks':
					c = cm.createSplitButton('wflinks', {
						title : 'Links insert, edit or remove',
						'class' : 'mceIcon mce_link',
						image : $.jlm.base + '/wildflower/img/icons/link.png',
						onclick : function() {
							//var se=ed.selection;
							console.info('Insert Link Clicked.');
							//$.jlm.components.tinyMce.insertLink(ed, se);
						}
					});

					c.onRenderMenu.add(function(c, m) {
						m.add({title : 'Links', 'class' : 'mceMenuItemTitle'}).setDisabled(1);

						m.add({
							title : '<img src="'+$.jlm.base + '/wildflower/img/icons/brick_add.png" class="mceIcon" />' + 'Insert a Link to Content or resource',
							onclick : function() {
								//var se=ed.selection;
								console.info('Insert Link Clicked.');
								//$.jlm.components.tinyMce.insertLink(ed, se);
							}
						});

						m.add({
							title : '<img src="'+$.jlm.base + '/wildflower/img/icons/world_link.png" class="mceIcon" />' + 'Insert Link to Off Site Url', 
							onclick : function() {
								//var se=ed.selection;
								console.info('Insert External Link Clicked.');
								//$.jlm.components.tinyMce.insertRemoteLink(ed, se);
							}
							//'class' : 'mceIcon mce_link'
						});

						m.add({
							title : '<img src="'+$.jlm.base + '/wildflower/img/icons/link_break.png" class="mceIcon" />' + 'Remove Link', 
							onclick : function() {
								//var se=ed.selection;
								//alert('Remove link clicked.');
							}
							//'class' : 'mceIcon mce_unlink'
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
