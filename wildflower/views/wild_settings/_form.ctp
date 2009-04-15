<?php 
	$i = 0; 
    //echo("$frmSettings");debug(Configure::read("$frmSettings"));die();
    foreach (Configure::read("$frmSettings") as $setting) {
        $name = "WildSetting.$frmSettings.{$setting[0]}";
        $options = array(
            'type' => 'text',
            'value' => $setting[1],
            'div' => array('id' => "setting-{$setting[0]}")
        );
        
        if (!empty($setting[3])) {
            $options['after'] = "<p class=\"setting-desc\">{$setting[3]}</p>";
        }

        
        if (empty($setting[4])) {
            $options['label'] = Inflector::humanize($setting[0]);
        } else {
            $options['label'] = $setting[4];
        }
        
        if ($options['type'] == 'text') {
            $options['size'] = 60;
        } else if ($options['type'] == 'textbox') {
            $options['rows'] = 4;
            $options['cols'] = 58;
        } else if ($options['type'] == 'checkbox' and $options['value'] == 1) {
            $options['checked'] = true;
        }
	echo $form->input($name, $options);
	echo $form->input("WildSetting.$frmSettings.{$setting[0]}.order", array('value' => $i++));
	}
?>