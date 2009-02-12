<?php 
$scripts = Configure::read('Icing.assets.scripts');
$stylesheets = Configure::read('Icing.assets.styles');
echo $html->doctype('xhtml-strict') ?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
    <?php echo $html->charset(); ?>
    
    <title><?php echo $title_for_layout; ?></title>
    
    <meta name="description" content="<?php echo isset($descriptionMetaTag) ? $descriptionMetaTag : '' ?>" />
    
    <link rel="shortcut icon" href="<?php echo $this->webroot;?>favicon.ico" type="image/x-icon" />
    <link rel="alternate" type="application/rss+xml" title="<?php echo $siteName; ?> RSS Feed" href="<?php echo $html->url('/posts/feed'); ?>" />

	<?php
		// echo $packager->css('admin/screen'); 
		echo $html->css('ui/ui.all', 'stylesheet', Array('media' => 'screen'));
		echo $html->css($stylesheets, 'stylesheet', Array('media' => 'screen'));
		echo $html->css(Array('print'), 'stylesheet', Array('media' => 'print'), false); 	?>

	<!--[if lte IE 6]>
	<?php echo $html->css(Array('ie6'), 'stylesheet', Array('media' => 'screen')); ?>
	<![endif]-->
	<!--[if lte IE 7]>
	<?php echo $html->css(Array('ie7'), 'stylesheet', Array('media' => 'screen')); ?>
	<![endif]-->
	<!--[if IE 6]>
	<script src="/themed/icing/js/dd-pngfix.js"></script>
	<script>
	  /* EXAMPLE */
	DD_belatedPNG.fix('#navWrap, #page, #navigation'); // argument is a CSS selector
	  
	  /* string argument can be any CSS selector */
	  /* .png_bg example is unnecessary */
	  /* change it to what suits you! */
	</script>
	<![endif]--> 

	<script type="text/javascript">
		var settings = {
			base: "<?php echo $this->base ?>",
			ctrlr: "<?php echo str_replace('wild_', '', $this->params['controller']) ?>",
			model: "<?php echo ucwords(Inflector::singularize($this->params['controller'])) ?>",
			action: "<?php echo $this->params['action'] ?>"
		}
		<?php echo $this->element('google_analytics') ?>
	</script>
	<?php 
		e($javascript->link($scripts));
	?>
</head>
<body id="<?php echo str_replace('wild_', '', $this->params['controller']) ?>" class="<?php echo $this->params['action'] ?>">

<div id="page" class="wrapper">
	<div id="header">
		<h1><?php echo $html->link(Configure::read('AppSettings.description'), '/', null, null, false) ?></h1>
		<p id="logo"><?php echo $html->link(Configure::read('AppSettings.site_name'), '/', null, null, false); ?></p>
	</div>

	<div id="navigation">
        <?php 
            echo $navigation->create(array(
                'Home' => '/',
                'Posts' => '/posts',
                'About' => '/about',
                'Contact' => '/contact'
            ), array('class' => 'tabs', 'liClass' => false));
        ?>
	</div>


	<div id="body" class="wrapper">
            <?php echo $content_for_layout; ?>
	</div>

	<div id="footer">
        <?php 
            echo $navigation->create(array(
                'Home' => '/',
                'Posts' => '/posts',
                'About' => '/about',
                'Contact' => '/contact'
            ), array('class' => 'tabs', 'liClass' => false));
        ?>

		<p class="quiet"><small><a href="http://majic3.com/">majic3</a> (using a fine mixure of my own code and <a href="http://wf.klevo.sk/"><?php	echo Configure::read('Wildflower.version');	?></a> with a splendor of Icing) is brought to you by <a href="http://cakephp.org/">CakePHP</a> &amp; <a href="http://jquery.com/">jQuery</a></small> and styled with <a href="http://code.google.com/p/css-boilerplate/">boilerplate</a></p>
	</div>
</div>
</body>
</html>

