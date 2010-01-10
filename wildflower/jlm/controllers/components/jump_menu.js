/**
 * Select Actions Component
 *
 * Used on lists with checkboxes. On checking some, action menus pop up.
 */
$.jlm.addComponent('jumpMenu', {
	startup: function ()	{
		this.targetEl = $('.jumpMenu');

		var onSelectChange = function() {
			var selected = $(this);
			var section = $(this).parent().attr('class').replace(/all/gi, '').toLowerCase();
			var saction = $.jlm.params.action.replace(/admin_/gi, '')
			var url = $.jlm.base + '/' + $.jlm.params.prefix + '/'+section+'/' + saction + '/';

			console.info(selected.val());

			if(selected.val() != 0){
				window.location.href = url + selected.val();
			}
		};

		this.targetEl.change(onSelectChange);
	}

})	;