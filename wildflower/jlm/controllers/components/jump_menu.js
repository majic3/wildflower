/**
 * Jump Menu
 *
 * Jumps to a new Page/ Post and lands on current action of the new content
 */
$.jlm.addComponent('jumpMenu', {
	startup: function ()	{
		this.targetEl = $('.jumpMenu');

		var onSelectChange = function() {
			var selected = $(this), section = '', saction = '', url = '';

			if((selected.attr('selected') != 'selected') && (selected.val() != '')){
				section = $(this).parent().attr('class').replace(/all/gi, '').toLowerCase();
				saction = $.jlm.params.action.replace(/admin_/gi, '');
				url = $.jlm.base + '/' + $.jlm.params.prefix + '/'+section+'/' + saction + '/';

				window.location.href = url + selected.val();
			}
		};

		this.targetEl.change(onSelectChange);
	}

});