$.jlm.addComponent('tinyMce', {
    
    focusOnReady: false,

    startup: function() {
        if (typeof(tinyMCE) == 'object') {
            $('textarea.tinymce').each(function() {
                var textareaEl = $(this);
                if (textareaEl.hasClass('fill_screen')) {
                    $.jlm.components.tinyMce.resizeToFillScreen(textareaEl);

                    $(window).bind('resize', function() {
                        var height = $.jlm.components.tinyMce.resizeToFillScreen(textareaEl);
                        $('.mceLayout').height(height);
                        $('.mceLayout iframe').height(height);
                    });
                }
                $.jlm.components.tinyMce.editorId = textareaEl.attr('id');
                tinyMCE.execCommand("mceAddControl", true, $.jlm.components.tinyMce.editorId);
            });
        }
	},
	
	getConfig: function() {
		var stylesheetUrl = $.jlm.base + '/wildflower/css/wf.mce.css';
		var fullBaseUrl = window.location.protocol + "//" + window.location.host + '/';
		return {
			mode: "none",
			theme: "advanced",
			// @TODO cleanup unneeded plugins
			plugins: "wildflower,bramus_cssextras,noneditable,safari,style,paste,directionality,visualchars,nonbreaking,xhtmlxtras,inlinepopups,fullscreen",
			doctype: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',

			// Theme options
			theme_advanced_buttons1: "undo,redo,copy,paste,|,bold,italic,strikethrough,|,formatselect,|,bullist,numlist,|,outdent,indent,blockquote,|,wfmedia,wflinks,wfmodules,|,charmap,code,fullscreen,|,bramus_cssextras_classes,bramus_cssextras_ids",
			theme_advanced_styles : "Align left=left;Align right=right",
			theme_advanced_buttons2: "",
			theme_advanced_buttons3: "",
			theme_advanced_toolbar_location: "top",
			theme_advanced_toolbar_align: "left",
			theme_advanced_statusbar_location: "bottom",
			theme_advanced_blockformats : "div,p,h1,h2,h3,h4,h5,h6,blockquote,dt,dd,code,samp",
			theme_advanced_resizing: false,
			theme_advanced_resize_horizontal: false,
			theme_advanced_path: true,
			width: '100%',

			// advanced image resizing - add advimagescale to the plugins
			//advimagescale_maintain_aspect_ratio: true, /* this is the default behavior */
			//advimagescale_fix_border_glitch: true, /* also the default behavior */
			//advimagescale_noresize_all: false, /* set to true to prevent all resizing on images */
			//advimagescale_append_to_url: false,
			//advimagescale_filter_class: 'wf_image', /* class of images managed by plugin - not external images nor widget place holders */
			//advimagescale_url_width_key: 'w',
			//advimagescale_url_height_key: 'h',
			//advimagescale_max_height: 200,
			//advimagescale_max_width:  200,
			//advimagescale_min_height: 20, 
			//advimagescale_min_width:  20,
			//advimagescale_loading_callback: function(imgNode) {
			//	alert(imgNode.src + ' is loading');
			//},
			//advimagescale_loaded_callback: function(imgNode) {
			//	alert(imgNode.src + ' is loaded');
			//},
			//advimagescale_resize_callback: function(editorInstance, imgNode) {
			//	console.info('resized to ' + imgNode.width + 'x' + imgNode.height);
			//	var imgSource = '', imgHtml = '', imgClass = '', imgAlt = '';
			//
			//	var regex = '\/wildflower\/thumbnail\/([a-zA-Z0-9\-_]*)\.(png|gif|jpg)\/([0-9]*)\/([0-9]*)\/([0-9]*)';
			//	var cImUrl = imgNode;//, re = new RegExp(regex, "g");
			//
			//	console.info(imgNode);
			//	imgSource = $('img', imgNode).attr('src');
			//	imgClass = $('img', imgNode).attr('class');
			//	imgAlt = $('img', imgNode).attr('alt');
			//	imgTitle = $('img', imgNode).attr('title');
			//	console.info(imgClass);
			//	console.info(imgAlt);
			//	console.info(imgSource);

			//	imgNode.src = '/wildflower/thumbnail/' + imgSource[1] + '.' + imgSource[2] + '/' + imgNode.width + '/' + imgNode.height + '/' + imgSource[5] + '/';
			//	imgHtml = '<img class="' + imgNode.class + '" src="'+imgNode.src+'" width="'+imgNode.width+'" height="'+imgNode.height+'" alt="' + imgNode.alt + '" />';
			//	editorInstance.execCommand('mceInsertContent', 0, imgHtml);
			//},

			// non editable content regions (these are edited as separate instances)
			noneditable_leave_contenteditable : true,
			noneditable_noneditable_class : 'block',

			// URLs
			relative_urls: false,
			remove_script_host: false,
			document_base_url: fullBaseUrl,
			convert_urls: false,
			cleanup_on_startup: true,
			
			content_css: stylesheetUrl,
			
			init_instance_callback: $.jlm.components.tinyMce.onReady
		};
	},
	
	focus: function() {
	    $.jlm.components.tinyMce.focusOnReady = true;
	},
	
	onReady: function(ed) {
	    $.jlm.components.tinyMce.editorInstance = ed;
	    if ($.jlm.components.tinyMce.focusOnReady) {
	        ed.focus();
	    }
	},
	
	loadInsertImageContent: function(url) {
	    $('.insert_image_sidebar').remove();
	    
	    $.get(url, function(html) {
	        var imageSidebarEl = $(html);
	        $('.main_sidebar').hide();
	        
	        $('#sidebar > ul').append(imageSidebarEl);
            
            // Bind selecting
            $('.file-list > li', imageSidebarEl).click(function() {
                $('#image-browser .selected').removeClass('selected');
                $(this).addClass('selected');
            });
            
            // Bind insert button
    		$('#insert_image', imageSidebarEl).click(function() {
    			var imgName = $('.selected img', imageSidebarEl).attr('alt');

    			if (typeof(imgName) == 'undefined' || trim(imgName) == '') {
    			    return false;
    			}

                // Original size
                imgNameEscaped = escape(imgName);
                var imgUrl = $.jlm.base + '/' + $.jlm.params.custom.wildflowerUploads + '/' + imgNameEscaped;

                // Thumbnail
                var resizeWidth = $('#resize_x', imageSidebarEl).val();
                var crop = 1;
                var resizeHeight = $('#resize_y', imageSidebarEl).val();
                if (intval(resizeHeight) < 1) {
                    resizeHeight = resizeWidth;
                }
                if (intval(resizeHeight) > 1) {
                    imgUrl = $.jlm.base + '/wildflower/thumbnail/' + imgNameEscaped + '/' + resizeWidth + '/' + resizeHeight + '/' + crop;
                }

				var imgAlt = $('#alt_txt', imageSidebarEl).val(), imgClass = $('#format_class', imageSidebarEl).val(), imgWH = '';

				if(imgAlt != '') imgName = imgAlt;
				if(resizeWidth && resizeHeight) imgWH =  ' width="' + resizeWidth + '" height="' + resizeHeight +'"';

    			// Image HTML
    			var imgHtml = '<img class="wf_image'+imgClass+'" '+imgWH+'alt="' + imgName + '" src="' + imgUrl + '" />';

    			$.jlm.components.tinyMce.editor.execCommand('mceInsertContent', 0, imgHtml);

    			return false;
    		});

    		// Bind close
            $('.cancel', imageSidebarEl).click(function() {
                $('.insert_image_sidebar').remove();
                $('.main_sidebar').show();
                return false;
            });
            
            // Bind pagination
            $('.paginator a', imageSidebarEl).click(function() {
                var url = $(this).attr('href');
                $.jlm.components.tinyMce.loadInsertImageContent(url);
                return false;
            });
			
			$('#assetCtrlTabs').tabs({ values: [10,20,30,40,50,60,70,80,90,100] });
			
			$('.imSize').click(function()	{	console.info('imSize')	});
			$('.imSize.advimg').click(function()	{
				var imgSize = $(this).text(), imSize = imgSize.split('x');
				$('#resize_x').val(imSize[0]);
				$('#resize_y').val(imSize[1]);
				$('#resize_image').data('origW', imSize[0]);
				$('#resize_image').data('origH', imSize[1]);
				$('#imSlider').slider({min: (imSize[0]*0.10), max: imSize[0], callback: function()	{
					
				}});
				$('#resize_crop').val('0');
				$('.imSize.reset').fadeIn('fast');
				$('#assetCtrlTabs').tabs('enable', [2]).tabs('select', [2]);
			});
			$('.imSize.small').click(function()	{
					var x = $('#resize_x').val(), y = $('#resize_y').val();
					if(x < 125)	{
						x = (x/100)*45;
					console.info('small: ' + $('#resize_x').val(x));
						y = Math.round(y*0.45);
					} else {
						x = x/100;
					console.info('large: ' + $('#resize_x').val());
						y = Math.round((y*x)/100);
						x = 125;
					}
					$('#resize_x').val(x); $('#resize_y').val(y);
					console.info('small: ' + $('#resize_x').val());
					console.info('small: ' +  $('#resize_y').val());
					$('.imSize.reset').fadeIn('fast');
			});
			$('.imSize.medium').click(function()	{
					var x = $('#resize_x').val(), y = $('#resize_y').val();
					if(x < 275)	{
						x = (x/100)*45;
						y = Math.round(y*0.45);
					} else {
						x = x/100;
					console.info('medium: ' + $('#resize_x').val());
						y = Math.round((y*x)/100);
						x = 275;
					}
					$('#resize_x').val(x); $('#resize_y').val(y);
					console.info('medium: ' + $('#resize_x').val());
					console.info('medium: ' +  $('#resize_y').val());
					$('.imSize.reset').fadeIn('fast');
			});
			$('.imSize.large').click(function()	{
					var x = $('#resize_x').val(), y = $('#resize_y').val();
					if(x < 450)	{
						x = (x/100)*65;
					console.info('large: ' + $('#resize_x').val());
						y = Math.round(y*0.65);
					} else {
						x = x/100;
					console.info('large: ' + $('#resize_x').val());
						y = Math.round((y*x)/100);
						x = 450;
					}
					$('#resize_x').val(x); $('#resize_y').val(y);
					console.info('large: ' + $('#resize_x').val());
					console.info('large: ' +  $('#resize_y').val());
					$('.imSize.reset').fadeIn('fast');
			});
			$('.imSize.reset').click(function()	{
					$('#resize_x').val($('#resize_image').data('origW')); $('#resize_y').val($('#resize_image').data('origH'));
				$(this).fadeOut('fast');
			});
		});
	},
	
	resizeImage: function(editor) {
		// like to be able to update the width/height settings in the image path /wildflower/image-name/width/height/crop
		// so when you drag the handles of images the path is updated wf creates the new resized copy of image and the markup has correct width & height in html.  Image attributes are also loaded in sidebar for editing that way too
		$.jlm.components.tinyMce.editor = editor;
	
		// Close if open
		if ($('.insert_image_sidebar').size() > 0) {
			$('.insert_image_sidebar').remove();
			$('.main_sidebar').show();
			return false;
		}
		
		var url = $.jlm.base + '/' + $.jlm.params.prefix + '/assets/insert_image';
		var attribs = {};
		$.jlm.components.tinyMce.reloadInsertImageContent(url, attribs);	    
		return false;
	},
	
	reloadInsertImageContent: function(url, attribs) {
	},
	
	insertImage: function(editor) {
	    $.jlm.components.tinyMce.editor = editor;
	    
	    // Close if open
	    if ($('.insert_image_sidebar').size() > 0) {
	        $('.insert_image_sidebar').remove();
	        $('.main_sidebar').show();
	        return false;
	    }
	    
	    var url = $.jlm.base + '/' + $.jlm.params.prefix + '/assets/insert_image';
	    $.jlm.components.tinyMce.loadInsertImageContent(url);	    
	    return false;
	},
	
	/* grid controls - insert grids based on the OOCSS Framework*/
	loadInsertGridContent: function(url) {
	},
	
	adjustGridCell: function(editor) {
	},
	
	insertGrid: function(editor) {
	},
	
	resizeToFillScreen: function(textareaEl) {
	    var otherContentHeight = $('body').height() - textareaEl.height();
	    var bumper = 20;
	    var result = $(window).height() - otherContentHeight - bumper; 
	    
		textareaEl.height(result);
		return result;
	},
	
	closeDialog: function() {
		$.jlm.components.tinyMce.dialogEl.remove();
	},
	
	insertEblock: function(editor) {
	    // Close if open
	    var alreadyOpenEl = $('.insert_eblock_sidebar');
	    if (alreadyOpenEl.size() > 0) {
	        alreadyOpenEl.remove();
	        $('.main_sidebar').show();
	        return false;
	    }
	    
	    var url = $.jlm.base + '/' + $.jlm.params.prefix + '/widgets/list_eblocks';
	    
	    $.get(url, function(html) {
	        var eblockSidebarEl = $(html);
	        $('.main_sidebar').hide();
	        $('#sidebar > ul').append(eblockSidebarEl);
	        
	        // Bind insert
	        $('.eblock_list a').click(function() {
	            var url = $.jlm.base + '/' + $.jlm.params.prefix + '/eblocks/insert_eblock';
	            var eblockId = $(this).attr('rel');
	            $.getJSON(url, function(json) {
	                var instanceId = json.id;
    	            var eblockHtml = '<div id="' + eblockId + '" class="wf_eblock wf_eblock_id_' + instanceId + '"></div>';
    	            editor.execCommand('mceInsertContent', 0, eblockHtml);
	            });
	            return false;
	        });
		});
	    
	    return false;
	},
	
	updateEblock: function(editor, id) {
		var strId = '#wfEBlock'+id, strContent = '';

	    var url = $.jlm.base + '/' + $.jlm.params.prefix + '/widgets/list_eblocks';

		// get the updated content from wildblocks

		// update the contents within
		editor.activeEditor.dom.setHTML(tinyMCE.activeEditor.dom.select(strId), strContent);
	},
	
	insertWidget: function(editor) {
	    // Close if open
	    var alreadyOpenEl = $('.insert_widget_sidebar');
	    if (alreadyOpenEl.size() > 0) {
	        alreadyOpenEl.remove();
	        $('.main_sidebar').show();
	        return false;
	    }
	    
	    var url = $.jlm.base + '/' + $.jlm.params.prefix + '/widgets/list_widgets';
	    
	    $.get(url, function(html) {
	        var widgetSidebarEl = $(html);
	        $('.main_sidebar').hide();
	        $('#sidebar > ul').append(widgetSidebarEl);
	        
	        // Bind insert
	        $('.widget_list a').click(function() {
	            var url = $.jlm.base + '/' + $.jlm.params.prefix + '/widgets/insert_widget';
	            var widgetId = $(this).attr('rel');
	            $.getJSON(url, function(json) {
	                var instanceId = json.id;
	                var src = $.jlm.base + '/wildflower/widgets/' + widgetId + '.png';
    	            var widgetHtml = '<img id="' + widgetId + '" class="admin_widget admin_widget_id_' + instanceId + '" src="' + src + '" />';
    	            editor.execCommand('mceInsertContent', 0, widgetHtml);
	            });
	            return false;
	        });
		});
	    
	    return false;
	},
    
    insertLink: function() {
        log('INSERT LINK');
    },
    
    insertRemoteLink: function() {
        log('INSERT REMOTE LINK');
    },
    
    insert: function() {
        log('INSERT REMOTE LINK');
    }
});
