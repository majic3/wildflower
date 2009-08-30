<?php echo $html->doctype('xhtml-strict'); ?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
    <?php echo $html->charset(); ?>
    
    <title><?php echo $title_for_layout; if(Configure::read('debug'))	{	echo " cake: " . Configure::version() . ";";  if(isset($this->theme)) echo " theme: " . $this->theme;	echo " Wildflower: " . Configure::read('Wildflower.version') . ";";	}	?></title>
    
    <meta name="description" content="<?php echo isset($descriptionMetaTag) ? $descriptionMetaTag : '' ?>" />
	<meta name="keywords" content="<?php echo isset($keywordsMetaTag) ? $keywordsMetaTag : '' ?>" />
	<!-- theme/wildflower default/layout -->
    
    <link rel="shortcut icon" href="<?php echo $this->webroot;?>favicon.ico" type="image/x-icon" />
    <link rel="alternate" type="application/rss+xml" title="<?php echo $siteName; ?> RSS Feed" href="<?php echo $html->url('/feed.rss'); ?>" />

	<script src="http://ajax.googleapis.com/ajax/libs/swfobject/2.1/swfobject.js" type="text/javascript"></script>
	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js" type="text/javascript"></script>
	<script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/jquery-ui.min.js" type="text/javascript"></script>
    <?php
	
	if(isset($canonical['rel']))	echo '<link rel="canonical" href="' . $canonical['rel'] . "\" />\n";
	if(isset($canonical['rev']['id']))	echo '<link rev="canonical" href="' . $canonical['rev']['slug'] . "\" />\n";

	$asset->checkTs = true;
	$asset->md5FileName = true;
	$asset->debug = false;

	// $asset->extras('js_init', "$(document).ready(function() {  });");

	// ga tracker using jquery
	$asset->extras('js_init', $this->element('google_analytics'));

	//	if($isPage) $asset->extras('js_init', "// swfObject set via page params");

		$styles = array(
			'oo/libraries',
			'oo/template',
			'oo/grids',
			'oo/content',
			//'oo/grids_debug',
			'oo/mod',
			//'oo/mod_debug',
			'oo/mod_skins',
			'formy',
			'screen'
		);
	$html->css($styles, 'stylesheet', Array('media' => 'screen'), false);
	$asset->extras('css_alt', Array('attribs' => array('media' => 'print'), 'rel' => 'stylesheet', 'css' => 'print'));
	
		$javascripts = array(
			'plugins/jquery.tipsy', 
			'plugins/jquery.gatracker', 
			'plugins/jquery.form', 
			//'plugins/retweet', 
			'common'
		);
		//	$asset->extras('gapi', array('http://ajax.googleapis.com/ajax/libs/swfobject/2.1/swfobject.js','http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js','http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/jquery-ui.min.js'));
		$javascript->link($javascripts, false);
		$asset->extras('css_fix', Array('attribs' => array('media' => 'screen'), 'condition' => 'if lte IE 7', 'rel' => 'stylesheet', 'css' => 'majic3_ie_lte7'));
		$asset->extras('css_fix', Array('attribs' => array('media' => 'print'), 'condition' => 'if IE 5', 'rel' => 'stylesheet', 'css' => 'formy_ie'));
		//$asset->extras('js_fix', Array('attribs' => array('type' => 'script'), 'condition' => 'if lte IE 7', 'js' => 'plugins/dd-pngfix'));
		// $asset->extras('js_fix', Array('attribs' => array('type' => 'script'), 'condition' => 'if IE', 'js' => 'plugins/html5'));
		//$asset->extras('js_fix', Array('attribs' => array('type' => 'block'), 'condition' => 'if lte IE 7', 'js' => 'DD_belatedPNG.fix(\'.png\');'));
		echo $asset->scripts_for_layout(); ?>
</head>
<?php echo $wild->bodyTagWithClass(isset($bdyClass) ? $bdyClass : false); ?>

<div class="wildflower">
	<div id="hd" class="hd">
		<img class="logo" alt="A CMS made with CakePHP" src="/wildflower/img/logo-orb.png" />
		<div id="skipto"><a href="#bd">skip to content</a></div>
		<h1><?php echo $html->link("<span>$title_for_layout</span>", '/', null, null, false) ?></h1>
	</div>

	<div id="nv">
		<?php $menu = ''; echo $menu = $wild->menu('main_menu', false, 'tabs'); ?>
	</div>


	<div id="bd" class="bd">
		<?php echo $content_for_layout; ?>
	</div>

	<div id="ft" class="ft">
		<div class="leftCol">
			<p><?php echo $html->link($html->image('wildflower.png', array('alt' => 'Powered by Wildflower CMS', 'width' => '80', 'height' => '15')), 'http://wf.klevo.sk/', array(), false, false); ?>Wildflower Logo designed by <a href="http://www.olivertreend.com/">Oliver Treend</a></p>
		</div>
		<div class="main">
			<div class="nv">
				<?php echo $menu; ?>
			</div>
			<?php echo $this->element('admin_link'); ?>
			<?php echo $this->element('debug_notice'); ?>
		</div>
	</div>
</div>
<?php //echo $asset->scripts_for_layout('footer'); ?>
</body>
</html>

