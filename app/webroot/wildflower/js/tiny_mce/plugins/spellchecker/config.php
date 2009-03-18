<?php
	//include($_SERVER['DOCUMENT_ROOT'] . "/app/config/tinymce_spellchecker.php");
	// General settings
	//$config['general.engine'] = 'GoogleSpell';
	//$config['general.engine'] = 'PSpell';
	$config['general.engine'] = 'PSpellShell';
	//$config['general.remote_rpc_url'] = 'http://icing.ss29/wildflower/js/rpc.php';

	// PSpell settings
	$config['PSpell.mode'] = PSPELL_FAST;
	//$config['PSpell.spelling'] = "";
	//$config['PSpell.jargon'] = "";
	//$config['PSpell.encoding'] = "";

	// PSpellShell settings
	//$config['PSpellShell.mode'] = PSPELL_FAST;
	//$config['PSpellShell.aspell'] = '/usr/bin/aspell';
	//$config['PSpellShell.tmp'] = $_SERVER['DOCUMENT_ROOT'] . '/app/tmp/spell';

	// Windows PSpellShell settings
	$config['PSpellShell.aspell'] = '"D:\\Aspell\\bin\\aspell.exe"';
	$config['PSpellShell.tmp'] = $_SERVER['DOCUMENT_ROOT'] . '/app/tmp/spell';
?>
