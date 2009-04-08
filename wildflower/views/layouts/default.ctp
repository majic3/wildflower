<?php 
/* todo: rel=canonical SEO stuff */
echo $html->doctype('xhtml-strict') ?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<?php echo $html->charset(); ?>

	<title><?php echo $title_for_layout; ?></title>

	<meta name="description" content="<?php echo isset($descriptionMetaTag) ? $descriptionMetaTag : '' ?>" />

	<link rel="shortcut icon" href="<?php echo $this->webroot;?>favicon.ico" type="image/x-icon" />
	<link rel="alternate" type="application/rss+xml" title="<?php echo $siteName; ?> RSS Feed" href="<?php echo $html->url('/posts/feed'); ?>" />
	<link rel="canonical" href="<?php echo($canonical) ?>" />

	<?php
		echo $html->css('ui/jquery-ui', 'stylesheet', Array('media' => 'screen'));
		// darwin will combine these using a minify cake filter - for clean living put your tweaks in scrren
		echo $html->css(array(
			'oo/libraries',
			'oo/template',
			'oo/grids',
			'oo/content',
			'screen',
		), 'stylesheet', Array('media' => 'screen'));
		//	echo $html->css(Array('print'), 'stylesheet', Array('media' => 'print'), false); 	?>
	<!--[if IE 6]>
	<script type="text/javascript" src="/js/plugins/dd-pngfix.js"></script>
	<script type="text/javascript">
	/* fixing pngs with style Drew Diller Style http://www.dillerdesign.com/experiment/DD_belatedPNG/ medicine for ie6 - see his roundies to */
	DD_belatedPNG.fix('.png'); // argument is a CSS selector
	  
	  /* string argument can be any CSS selector */
	  /* .png_bg example is unnecessary */
	  /* change it to what suits you! */
	</script>
	<![endif]-->
	<?php	
	// safe to remove this if you not interested in gfeed jquery plugin displaying feeds
	if(Configure::read('Icing.gfeed.api')):	$hasFeeds = true;	?>
	<script type="text/javascript" src="http://www.google.com/jsapi?key=<?php	echo Configure::read('Icing.gfeed.api');	?>"></script>
	<?php	endif;	?>

	<script type="text/javascript">
		var settings = {
			base: "<?php echo $this->base ?>",
			ctrlr: "<?php echo str_replace('wild_', '', $this->params['controller']) ?>",
			model: "<?php echo ucwords(Inflector::singularize($this->params['controller'])) ?>",
			action: "<?php echo $this->params['action'] ?>",
			hasFeeds: <?php echo isset($hasFeeds) ? 'true' : 'false'; ?>
		}
		<?php
			// ga tracker using jquery
			echo $this->element('google_analytics') ?>
	</script>
	<?php
		$javascripts = array(
			'swfobject', 
			'jquery',
			'plugins/jquery-ui-1.7', 
			'plugins/jquery.tipsy', 
			'plugins/jquery.gatracker', 
			'plugins/jquery.form'
		);

		if(isset($hasFeeds))	$javascripts[] = 'plugins/jquery.gfeed';

		$javascripts[] = 'common';
		e($javascript->link($javascripts));
	?>
</head>
<?php echo $wild->bodyTagWithClass(); ?>
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
	/*	OO CSS has width settings applied to page container via the class - customise yours see icing example - remove for liquid oldScool for narrow	*/	?>
<div id="page" class="icing">
	<div id="hd">
		<div id="skipto"><a href="#main">skip to content</a></div>
		<div id="ident">
			<p><?php echo Configure::read('AppSettings.site_name'); ?></p>
		</div>
		<h1><?php echo $html->link(Configure::read('AppSettings.description'), '/', null, null, false) ?></h1>
		<div id="searchrss"><?php	//echo $this->element('sidebar_search'), $html->link($html->image('feed.png', Array()), '/posts/feed', Array('id' => 'rss'), false, false);	?></div>
	</div>

	<div id="nv">
		<?php 
			echo $navigation->create(array(
				'Home' => '/',
				ucfirst(Configure::read('Wildflower.blogName')) => '/' . Configure::read('Wildflower.blogIndex'),
				'About' => '/about',
				'Contact' => '/contact'
			), array('class' => 'tabs', 'liClass' => false));
		?>
	</div>


	<div id="bd">
		<?php echo $content_for_layout; ?>

		<?php	if(isset($rssFeeds) && $hasFeeds)	{	?><div id="feeds"><?php	foreach($rssFeeds as $feed): echo ($html->link($feed['name'], 'http://' . $feed['url'], Array('class' => 'feed'))); endforeach;	?></div><?php	}	?>
	</div>

	<div id="ft">
		<?php 
			echo $navigation->create(array(
				'Home' => '/',
				ucfirst(Configure::read('Wildflower.blogName')) => '/' . Configure::read('Wildflower.blogIndex'),
				'About' => '/about',
				'Contact' => '/contact'
			), array('class' => 'tabs', 'liClass' => false));
		?>
		<p class="quiet"><small>Wildflower is a CakePHP, utilizing jQuery. Theme by Sam@Majic3 using OO CSS</small></p>
		<?php	if ($isLogged and $this->params['action'] != 'wf_preview') echo '<p class="quiet"><small>', $this->element('admin_link'), '</small></p>';	?>
	</div>
</div>
</body>
</html>

