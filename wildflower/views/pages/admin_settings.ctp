<h2 class="section">Settings for this Page <?php echo $html->link($this->data['Page']['title'], array('action' => 'edit', $this->data['Page']['id'])); ?></h2>
<div id="currentSettings"><?php
	echo 
	$form->create('Page', array('url' => $here, 'type' => 'file'));
	
	// media prefix set in wf_core.php
	$mprefix = Configure::read('Wildflower.mediaRoute');
	if (empty($customFields)) {
		echo '<p>', __('This page has no Settings defined.', true), '</p>', '<p><a href="#add" class="add">add</a></p>';
	} else {
		foreach ($customFields as $field) {
			echo '<div class="settings">', $form->input($field['name'], array('type' => $field['type'], 'value' => $field['value'], 'between' => '<br />'));
			if ($field['type'] == 'file' and !empty($field['value'])) {
				echo '<img width="80" height="80" src="', $html->url("/$mprefix/thumbnail/{$field['value']}/80/80/1"), '" alt="" />';
			}
			echo '<ul><li><a href="#edit" class="edit">edit</a></li><li><a href="#delete" class="delete">remove</a></li></ul></div>';
		}
		echo '<p><a href="#add" class="add">add</a></p>';
	}

	/*
		
		<div class="actions">
			<ul>
				<li>save to children</li>
				<li>define as preset</li>
			</ul>
		</div>
	*/
?>

<?php
	echo 
	$form->end('Save');
?>
</div>

<div id="availableSettings">
	<p class="notice">These Settings Apply only to this Page</p>
	<div id="addCustom">
		<h3>Custom Settings</h3>
		<div class="settings">
			<dl>
				<dt>Setting.Name</dt>
				<dd>value</dd>
			</dl>
		</div>
	</div>
	<div id="addPreset">
		<h3>Preset Settings</h3>
		<div id="menuSettings" class="settings">
			<h4>Menu Settings (are added to sidebar automatically)</h4>
			<dl>
				<dt><a href="#add" class="add">Menu.tree</a></dt>
				<dd>Displays a tree menu of child pages</dd>
				<dt><a href="#add" class="add">Menu.firstGen</a></dt>
				<dd>Displays immediate children</dd>
				<dt><a href="#add" class="add">Menu.byName</a></dt>
				<dd>Displays a named menu</dd>
				<dt><a href="#add" class="add">Menu.byId</a></dt>
				<dd>Displays a menu by ID Number</dd>
			</dl>
		</div>
		<div id="reigonSettings" class="settings">
			<h4>Reigon Settings</h4>
			<dl>
				<dt><a href="#add" class="add">Reigon.name</a></dt>
				<dd>Adds a reigon for the page</dd>
			</dl>
		</div>
		<div id="seoSettings" class="settings">
			<h4>Seo Settings</h4>
			<dl>
				<dt><a href="#add" class="add">Seo.pr</a></dt>
				<dd>Proritiy Setting</dd>
				<dt><a href="#add" class="add">Seo.changefreq</a></dt>
				<dd>Regularity of updates</dd>
			</dl>
		</div>
		<div id="directorSettings" class="settings">
			<h4>Director Settings</h4>
			<dl>
				<dt>Director.pr</dt>
				<dd>some director setting</dd>
			</dl>
		</div>
	</div>

<span class="cleaner"></span>
</div>

<span class="cleaner"></span>



<?php $partialLayout->blockStart('sidebar'); ?>
    <?php echo $this->element('../pages/_page_edit_right_menu'); ?>
<?php $partialLayout->blockEnd(); ?>