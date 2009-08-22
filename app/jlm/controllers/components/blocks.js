$.jlm.addComponent('blocks', {
    
    edit: function(e) {
        var t = this;
        
        // First make sure this is a block el
        var jEl = $(e);
        if (!jEl.hasClass('wf_blocks')) {
            return false;
        }
        
        // Hide sidebar contet
        t.sidebarContent = $('#sidebar ul');
        t.sidebarContent.hide();
        
        // Hide main content
        t.contentPadEl = $('#content_pad');
        t.mainContent = t.contentPadEl.children();
        t.mainContent.hide();
        
        // Load the blocks config action
        var blockName = jEl.attr('id');
        var blockId = jEl.attr('class').replace('wf_block wf_block_id_', '');
        var url = $.jlm.base + '/' + $.jlm.params.prefix + '/blocks/config/' + blockName + '/' + blockId;
        
        $.post(url, function(html) {
            var configEl = $(html);
            t.contentPadEl.append(configEl);
            
            // Bind AJAX save
            function successCallback() {
                t.closeEdit();
                return false;
            }
            $('#edit_block_form').ajaxForm({ success: successCallback });
            
            // Bind cancel button
            $('#CancelblockEdit').click(successCallback);
            
            // Add new
            //$('a[href=#AddNewCell]').click(t.addNewCell);
        });
	},
	
	addNewCell: function() {
	    var newBlockEl = $('.slider_block:first').clone();
	    var index = $('.slider_block').size();
	    $('input:first', newBlockEl).val('').attr('name', 'data[Wildblock][items][' + index + '][label]');
	    $('input:last', newBlockEl).val('').attr('name', 'data[Wildblock][items][' + index + '][url]');
        // newBlockEl = '<div class="slider_block">' + newBlockEl.html() + '</div>';
        
        // newBlockEl = newBlockEl.replace('0', index.toString());
	    $('.slider_block:last').after(newBlockEl);
	},
	
	closeEdit: function() {
        this.contentPadEl.children(':visible').remove();
        this.sidebarContent.show();
        this.mainContent.show();
        $.jlm.components.tinyMce.resizeToFillScreen($('.tinymce'));
	}
	
});
