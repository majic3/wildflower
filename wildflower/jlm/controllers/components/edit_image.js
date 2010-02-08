$.jlm.addComponent('editImage', {

	edIm: null,

	startup: function() {

		// add some basic shortcuts - eg small, medium, large - sq
		// these keyword presets retain an association with the orig ideal for galleries

		// add saveAsNew set up - show name option

		// add some interface to take advantage of the full range of options available through the jcrop plugin
	
		// apply the jcrop plugin
		$('#imageAsset').Jcrop({
			onChange: $.jlm.components.editImage.showPreview,
			onSelect: $.jlm.components.editImage.showPreview,
			aspectRatio: 1
		});
	},

	
	showPreview: function (coords)
	{
		if (parseInt(coords.w) > 0)
		{
			var rx = 100 / coords.w;
			var ry = 100 / coords.h;

			jQuery('#fullPreview').css({
				width: Math.round(rx * 500) + 'px',
				height: Math.round(ry * 370) + 'px',
				marginLeft: '-' + Math.round(rx * coords.x) + 'px',
				marginTop: '-' + Math.round(ry * coords.y) + 'px'
			});
		}
	},
	
	saveAsNew: function() {
	},
	
	closeEdit: function() {
	}
	
});
