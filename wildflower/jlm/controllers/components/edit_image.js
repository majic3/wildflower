$.jlm.addComponent('editImage', {

	startup: function() {

		var edImDim = [0,0];

		function showPreview(coords)
		{

			if (parseInt(coords.w) > 0)
			{
				var rx = 100 / coords.w;
				var ry = 100 / coords.h;

			//console.info(edImDim);
			//console.info(coords);

				$('#imagePreview').css({
					width: Math.round(rx * edImDim[0]) + 'px',
					height: Math.round(ry * edImDim[1]) + 'px',
					marginLeft: '-' + Math.round(rx * coords.x) + 'px',
					marginTop: '-' + Math.round(ry * coords.y) + 'px'
				});
			}
		}

		// add some basic shortcuts - eg small, medium, large - sq
		// these keyword presets retain an association with the orig ideal for galleries
		edImCtrls = $('<div id="edImCtrls"><ul class="tabs"><li><a href="#makeNew">Make New</a></li><li><a href="#small">small</a></li><li><a href="#medium">medium</a></li><li><a href="#large">large</a></li><li><a href="#square">square</a></li><li><a href="#6by4">6:4</a></li><li><a href="#4by6">4:6</a></li><li><a href="#imRatio">Image Ratio</a></li><li><a href="#uncon">uncontrained</a></li></ul></div>')
		$('#content').find('h2').after(edImCtrls);

		// add saveAsNew set up - show name option

		// add some interface to take advantage of the full range of options available through the jcrop plugin
	
		// apply the jcrop plugin
		edImDim[0] = $('#imageAsset').width();
		edImDim[1] = $('#imageAsset').height();

		//$('#imagePreview')
		//	.attr('width', edImDim[0])
		//	.attr('height', edImDim[1]);

		$('#imageAsset')
			.Jcrop({
				onChange: showPreview,
				onSelect: showPreview,
				aspectRatio: 1
			});
	},
	
	saveAsNew: function() {
	},
	
	closeEdit: function() {
	}
	
});
