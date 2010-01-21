<?php
App::import('Vendor', 'HtmlPurifier.HTMLPurifier', array('file' => 'htmlpurifier/HTMLPurifier.standalone.php'));

class HtmlPurifierComponent extends Object {

	var $config = array(
		'Core.Encoding' => 'utf-8',
		'HTML.DefinitionID' => 'CakePHP',
		'HTML.DefinitionRev' => 1,
		'HTML.TidyLevel' => 'medium',
		'HTML.Doctype' => 'XHTML 1.0 Transitional'
	);

	var $Purifier;

	var $PurifierConfig;

	function initialize(&$controller, $settings = array()) {
		$this->config = array_diff($this->config, $settings);
		foreach ($settings as $setting => $value) {
			$this->config[$setting] = $value;
		}
	}

	function startup(&$controller) {
		$this->PurifierConfig = HTMLPurifier_Config::createDefault();
		foreach ($this->config as $k => $v) {
			$this->PurifierConfig->set($k, $v);
		}
		$this->Purifier =& new HTMLPurifier($this->PurifierConfig);
	}

	function purify($data) {
		return $this->Purifier->purify($data);
	}

}
?>