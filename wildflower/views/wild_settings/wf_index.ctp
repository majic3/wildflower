<h2 class="section">Site Settings</h2>
<div class="tabs">
<?php
    $session->flash();
	$adminCustomSettings = array_values(am(Configure::read('System.adminCustomSettings'), Configure::read('Wildflower.settings.adminCustomSettings')));
	$SiteSettings = array_flip(array_keys($adminCustomSettings));
    echo $form->create('WildSetting', array('action' => 'update', 'class' => 'horizontal-form'));
    
    // echo '<pre>';
    // foreach ($settings as $setting) {
    //     $out = "array(\n";
    //     foreach ($setting['WildSetting'] as $label => $value) {
    //         if (!is_numeric($value)) {
    //             $value = "'$value'";
    //         }
    //         $out .= "'$label' => $value,\n";
    //     }
    //     $out .= "),";
    //     echo $out;
    // }
    // echo '</pre>';    
    
    foreach ($settings as $setting) {
        $name = "WildSetting.{$setting['WildSetting']['id']}";
        $options = array(
            'type' => $setting['WildSetting']['type'],
            'value' => $setting['WildSetting']['value'],
            'div' => array('id' => "setting-{$setting['WildSetting']['name']}")
        );
        
        if (!empty($setting['WildSetting']['description'])) {
            $options['after'] = "<p class=\"setting-desc\">{$setting['WildSetting']['description']}</p>";
        }
        
        if ($setting['WildSetting']['name'] == 'home_page_id') {
            $options['options'] = $homePageIdOptions;
            $options['escape'] = false;
        } else if ($setting['WildSetting']['name'] == 'email_delivery') {
            $options['options'] = array('mail' => 'Local server', 'smtp' => 'SMTP account');
            if (Configure::read('debug') > 0) {
                $options['options']['debug'] = 'Dump to screen';
            }
        } else if ($setting['WildSetting']['name'] == 'cache') {
            $options['options'] = array('on' => 'On', 'off' => 'Off');
        //} else if ($setting['WildSetting']['name'] == 'themes.public') {	read themes available
        } else if ($setting['WildSetting']['name'] == 'adminCustomSettings') { 
            $options['type'] = 'select';
            $options['before'] = "<p><span class=\"admin-only\">admin</span></p>";
            $options['after'] = "<p class=\"setting-desc\">{$setting['WildSetting']['description']}</p>";
        }
        
        if (empty($setting['WildSetting']['label'])) {
            $options['label'] = Inflector::humanize($setting['WildSetting']['name']);
        } else {
            $options['label'] = $setting['WildSetting']['label'];
        }
        
        if ($options['type'] == 'text') {
            $options['size'] = 60;
        } else if ($options['type'] == 'textbox') {
            $options['rows'] = 4;
            $options['cols'] = 58;
        } else if ($options['type'] == 'checkbox' and $options['value'] == 1) {
            $options['checked'] = true;
        }

		// if the setting is XXX.name then it is grouped otherwise it is general
		// some settings are non-deleteble but can be reset - admin user only - checking for admin user name
		// some are only editable by admin user - but viewed by all
		$chk = strpos($setting['WildSetting']['name'], '.');
        if($chk === false)	{
			$SiteSettings['general'][]= $form->input($name, $options);
		} else {
			$SiteSettings[substr($setting['WildSetting']['name'], 0, $chk-1)][]= $form->input($name, $options);
		}
    }
	
	echo $this->element('../wild_settings/_grouped', array("adminCustomSettings" => $adminCustomSettings));
	$i = 0;
	foreach($adminCustomSettings as $key)	{
		if(!empty($key))	{
			$lkey = strtolower(Inflector::singularize($key));
			echo "<div id=\"$key\">", '<h3>', Inflector::humanize($key), '</h3>';
			echo (array_key_exists($lkey, $SiteSettings)) ? implode('', $SiteSettings[$lkey]) : $this->element('../wild_settings/_form', Array('frmSettings' => $key));
			echo "</div>";
			$groupOptions[$lkey] = "$i $key";
			$i++;
		}
	}
    
    echo
    $form->submit('Save changes', array('div' => array('class' => 'submit save-section'))),
    '<div class="cleaner"></div>',
    $form->end();
?>	   
</div>

<?php $partialLayout->blockStart('sidebar'); ?>
    <li class="sidebar-box">
        <?php 
// array of merged named groupings for settings name.XXXX
echo $form->create('WildSetting', array('action' => 'add')),
     $form->input('name'),
     $form->input('value'),
     $form->input('description'),
     $form->input('order'),
     $form->input('isGeneral', Array('type' => 'checkbox', 'label' => 'If this is an additional general setting')),
     $form->input('type', array(
        'type' => 'select', 
        'options' => $groupOptions
     )),
     $form->end('Add'); ?>
    </li>
<?php $partialLayout->blockEnd(); ?>
