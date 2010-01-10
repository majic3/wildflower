/**
 * Page Setting Control aka customFields
 *
 * Manages the interface for custom settings
 */
$.jlm.addComponent('customFields', {
	startup: function ()	{
		this.currentSettingEl = $('.settings', '#currentSettings');
		this.availSettingEl = $('.settings', '#availableSettings');
	},
	add: function ()	{
		console.info('customFieldsComponent|add');
	},
	addCustom: function ()	{
		console.info('customFieldsComponent|addCustom');
	},
	cancel: function ()	{
		console.info('customFieldsComponent|cancel');
	},
	save: function ()	{
		console.info('customFieldsComponent|save');
	},
	delete: function ()	{
		console.info('customFieldsComponent|delete');
	},
	edit: function ()	{
		console.info('customFieldsComponent|edit');
	}

});