<?php
/* SVN FILE: $Id: css.php 7945 2008-12-19 02:16:01Z gwoo $ */
/**
 * Short description for file.
 *
 * Long description for file
 *
 * PHP versions 4 and 5
 *
 * CakePHP(tm) :  Rapid Development Framework (http://www.cakephp.org)
 * Copyright 2005-2008, Cake Software Foundation, Inc. (http://www.cakefoundation.org)
 *
 * Licensed under The MIT License
 * Redistributions of files must retain the above copyright notice.
 *
 * @filesource
 * @copyright     Copyright 2005-2008, Cake Software Foundation, Inc. (http://www.cakefoundation.org)
 * @link          http://www.cakefoundation.org/projects/info/cakephp CakePHP(tm) Project
 * @package       cake
 * @subpackage    cake.app.webroot
 * @since         CakePHP(tm) v 0.2.9
 * @version       $Revision: 7945 $
 * @modifiedby    $LastChangedBy: gwoo $
 * @lastmodified  $Date: 2008-12-18 18:16:01 -0800 (Thu, 18 Dec 2008) $
 * @license       http://www.opensource.org/licenses/mit-license.php The MIT License
 */	

if (!defined('CAKE_CORE_INCLUDE_PATH')) {
	header('HTTP/1.1 404 Not Found');
	exit('File Not Found');
}

	if (preg_match('|\.\.|', $url) || !preg_match('|^([^/]*)/(.+)$|i', $url, $regs)) {
		die('Wrong file name.');
	}
	App::import('Vendor', 'CakeMinify', Array('file' => 'CakeMinify.php'));
	switch($regs[1])	{
		case 'cjs': 
	$js = new CakeMinify(Configure::read('Asset.filter.cache'), 'js');
	$js->files = explode(',', $regs[2]);
	$output = $js->process();
	$templateModified = $js->getModified();
	header("Date: " . date("D, j M Y G:i:s ", $templateModified) . 'GMT');
	header("Content-Type: text/javascript");
	header("Expires: " . gmdate("D, j M Y H:i:s", time() + DAY) . " GMT");
	header("Cache-Control: max-age=86400, must-revalidate"); // HTTP/1.1
	header("Pragma: cache");        // HTTP/1.0
		break;
		case 'ccss':
		default:
	$css = new CakeMinify(Configure::read('Asset.filter.cache'), 'css');
	$css->files = explode(',', $regs[2]);
	$output = $css->process();
	$templateModified = $css->getModified();

	header("Date: " . date("D, j M Y G:i:s ", $templateModified) . ' GMT');
	header("Content-Type: text/css");
	header("Expires: " . gmdate("D, j M Y H:i:s", time() + DAY) . " GMT");
	header("Cache-Control: max-age=86400, must-revalidate"); // HTTP/1.1
	header("Pragma: cache");        // HTTP/1.0
		break;
	}

		print $output;

?>