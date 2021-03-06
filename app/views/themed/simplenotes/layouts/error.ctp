<?php echo $html->doctype('xhtml-strict'); ?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
    <?php echo $html->charset(); ?>
    
    <title><?php echo $title_for_layout; if(Configure::read('debug'))	{ echo " cake: " . Configure::version() . ";";  if(isset($this->theme)) echo " theme: " . $this->theme;	echo " Wildflower: " . Configure::read('Wildflower.version') . ";"; }	?></title>
    
    <meta name="description" content="<?php echo isset($descriptionMetaTag) ? $descriptionMetaTag : '' ?>" />
	<meta name="keywords" content="<?php echo isset($keywordsMetaTag) ? $keywordsMetaTag : '' ?>" />
	<!-- app/views default/layout -->
    
    <link rel="shortcut icon" href="<?php echo $this->webroot;?>favicon.ico" type="image/x-icon" />
    <link rel="alternate" type="application/rss+xml" title="<?php echo $siteName; ?> RSS Feed" href="<?php echo $html->url('/' . Configure::read('Wildflower.blogIndex') . '/rss'); ?>" />

    <?php
	
	if(isset($canonical['rel']))	echo '<link rel="canonical" href="' . $canonical['rel'] . "\" />\n";
	if(isset($canonical['rev']['id']))	echo '<link rev="canonical" href="' . $canonical['rev']['slug'] . "\" />\n";
		$styles = array(
			'simplenotes/screen'
		);
		
	echo $html->css(am($simplenotesStyles, $styles), 'stylesheet', Array('media' => 'screen'), true); ?>
</head>
<body class="error">

<div class="wildflower">
	<div id="hd" class="hd">
		<img class="logo" alt="A CMS made with CakePHP" src="/wildflower/img/logo-orb.png" width="55" height="55" />
		<div id="skipto"><a href="#bd">skip to content</a></div>
        <h1><?php echo $html->link("<span>$title_for_layout</span>", '/', null, null, false) ?></h1>
	</div>

	<div id="nv">
	</div>


	<div id="bd" class="bd">
        <?php echo $content_for_layout; ?>
	</div>

	<div id="ft" class="ft">
		<div class="leftCol">
			<p><?php echo $html->link($html->image('wildflower.png', array('alt' => 'Powered by Wildflower CMS', 'width' => '80', 'height' => '15')), 'http://wf.klevo.sk/', array(), false, false); ?>.</p>
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
<?php echo $this->element('google_analytics'); ?>
</body>
</html>

