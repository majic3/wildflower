/**
 * Page Setting Control aka customFields
 *
 * Manages the interface for custom settings
 */
$.jlm.addComponent('customFields', {
	startup: function ()	{
		this.currentSettingEl = $('.settings', '#currentSettings');
		this.availSettingEl = $('.settings', '#availableSettings');
	}
});