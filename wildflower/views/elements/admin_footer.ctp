<?php

if($session->read('Auth.User'))	{
	echo $this->element('admin_link'), '$possibleThemeFile: ', (isset($possibleThemeFile)) ? $possibleThemeFile : '';
}

$debugLevel = Configure::read('debug');
if ($debugLevel > 0) { echo $this->element('debug_notice'); } ?>