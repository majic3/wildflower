<?php 
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
		echo $html->css(array(
			'boilerplate.css', 
			'plugins.css', 
			'tipsy.css', 
			'jscrollpane.css', 
			'growl.css', 
			'iscreen.css'
		), 'stylesheet', Array('media' => 'screen'));
		echo $html->css(Array('print'), 'stylesheet', Array('media' => 'print'), false); 	?>

	<!--[if lte IE 6]>
	<?php echo $html->css(Array('ie6'), 'stylesheet', Array('media' => 'screen')); ?>
	<![endif]-->
	<!--[if lte IE 7]>
	<?php echo $html->css(Array('ie7'), 'stylesheet', Array('media' => 'screen')); ?>
	<![endif]-->
	<!--[if IE 6]>
	<script src="/js/dd-pngfix.js"></script>
	<script>
	  /* fixing pngs with style Drew Diller Style */
	DD_belatedPNG.fix('#navWrap, #page, #navigation'); // argument is a CSS selector
	  
	  /* string argument can be any CSS selector */
	  /* .png_bg example is unnecessary */
	  /* change it to what suits you! */
	</script>
	<![endif]-->

	<script type="text/javascript" src="http://www.google.com/jsapi?key=<?php	echo Configure::read('Icing.gfeed.api');	?>"></script>
	<script type="text/javascript">
		var settings = {
			base: "<?php echo $this->base ?>",
			ctrlr: "<?php echo str_replace('wild_', '', $this->params['controller']) ?>",
			model: "<?php echo ucwords(Inflector::singularize($this->params['controller'])) ?>",
			action: "<?php echo $this->params['action'] ?>"
		}
		<?php
			// ga tracker using jquery
			echo $this->element('google_analytics') ?>
	</script>
	<?php 
		e($javascript->link(array(
			'jquery', 
			'swfobject', 
			'jquery-ui', 
			'jquery.jScrollPane',
			'jquery.form', 
			'jquery.tipsy', 
			'jquery.blockui', 
			'jquery.growl', 
			'jquery.gfeed', 
			'jquery.gatracker', 
			'jquery.easing',
			'shadowbox', 
			'common'
		)));
	?>
</head>
<body id="<?php echo (($this->params['controller'] == 'wild_pages') ? $this->params['Wildflower']['page']['slug'] : str_replace('wild_', '', $this->params['controller'])); ?>" class="<?php echo (($this->params['controller'] == 'wild_pages') ? $this->params['Wildflower']['page']['slug'] : str_replace('wild_', '', $this->params['controller'])); ?> <?php echo $this->params['action'] ?>">
<?php
        // Admin bar
        // Do not show for previews
        if ($isLogged and $this->params['action'] != 'wf_preview') {
            $c = str_replace('wild_', '', $this->params['controller']);
            $editCurrentLink = '/' 
                . Configure::read('Wildflower.prefix') 
                . '/' . $c . '/edit/' . '';
            
            echo 
            '<div id="admin-bar"><ul class="tabs"><li>',
                $html->link('Site admin', '/' . Configure::read('Wildflower.prefix')),
                '</li><li>',
                $html->link('Edit current page', $editCurrentLink), 
             '</li></ul></div>';
        }
    ?>

<div id="page" class="wrapper">
	<div id="header">
		<p id="ident"><?php echo $html->link(Configure::read('AppSettings.site_name'), '/', null, null, false); ?></p>
		<h1><?php echo $html->link(Configure::read('AppSettings.description'), '/', null, null, false) ?></h1>
		<div class="searchBox"><?php	echo ($this->element('sidebar_search'));	?></div>
		<?php	echo $html->link($html->image('feed.png', Array()), '/posts/feed', Array('id' => 'rss'), false, false)	?>
	</div>

	<div id="navigation">
        <?php 
            echo $navigation->create(array(
                'Home' => '/',
                ucfirst(Configure::read('Wildflower.blogName')) => '/' . Configure::read('Wildflower.blogIndex'),
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
                ucfirst(Configure::read('Wildflower.blogName')) => '/' . Configure::read('Wildflower.blogIndex'),
                'About' => '/about',
                'Contact' => '/contact'
            ), array('class' => 'tabs', 'liClass' => false));
        ?>

		<p class="quiet"><small>Powered by <?php 
	           echo $html->link('Wildflower', 'http://wf.klevo.sk/'),
	           '. ',
	           $this->element('admin_link') ?> <a href="http://majic3.com/">icing <?php	echo Configure::read('Icing.version');	?></a>  &#124; <a href="http://cakephp.org/"><img src="/img/cake.power.gif" /></a> &#124; <a href="http://jquery.com/"><img src="/img/jquery-icon.png" /></a> &#124; <a href="http://code.google.com/p/css-boilerplate/">boilerplate</a></small></p>
	</div>
</div>
</body>
</html>

