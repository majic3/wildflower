/*
##########################################
##	Common JS Icing						##
##########################################
##	02/01/2009							##
##		pagination						##
##										##
##										##
##########################################
*/

// alert('coomon');

$(document).ready(function()	{
	// google analytic tracking
	if(gaID !== null)	{
		$.jGoogleAnalytics(gaID);
	}

	// nice titles jquery sifr
	$('h2, h3, h4').sifr({
		path: '/themed/icing/swf/fonts/', // this will prepend 'resources/fonts/' to the font name
		font: 'trebuchet-ms', // this will load the font name 'My Awesome Font.swf'
		version: '8',
		embedOptions: {
			wmode: 'transparent' // this will disable the transparency of the sIFR embedding
		},
		save: true
	});
});