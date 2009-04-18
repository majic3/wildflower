<?php 
echo $html->doctype('xhtml-trans') ?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<?php echo $html->charset(); ?>

	<title><?php echo $title_for_layout; ?><?php	if(Configure::read('debug'))	echo "cake: " . Configure::version();	?></title>

	<meta name="description" content="<?php echo isset($descriptionMetaTag) ? $descriptionMetaTag : '' ?>" />

	<link rel="shortcut icon" href="<?php echo $this->webroot;?>favicon.ico" type="image/x-icon" />
	<link rel="alternate" type="application/rss+xml" title="<?php echo $siteName; ?> RSS Feed" href="<?php echo $html->url('/posts/feed'); ?>" />
	<link rel="canonical" href="<?php echo($canonical) ?>" />

	<?php
		echo $html->css('ui/jquery-ui-1.7.1', 'stylesheet', Array('media' => 'screen'));
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
			'plugins/jquery-ui-1.7.1', 
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
    ?>

<div class="wildflower">
	<div id="hd" class="hd">
		<div id="skipto"><a href="#main">skip to content</a></div>
		<p><?php echo Configure::read('AppSettings.site_name'); ?></p>
		<h1><?php echo $html->link(Configure::read('AppSettings.description'), '/', null, null, false) ?></h1>
		<div id="searchrss"><?php	echo $this->element('search_form'), $html->link($html->image('feed.png', Array()), '/posts/feed', Array('id' => 'rss'), false, false);	?></div>
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


	<div id="bd" class="bd">
		<?php 
			/*
				optional leftCol & rightCol with selected widgets
				for better SEO source ordering use nested lines.
				Compass can help you generate nicer classes for seo
				but not pages apart from home
			*/
			echo $content_for_layout; ?>

		<?php	if(isset($rssFeeds))	{	?><div id="feeds"><?php	foreach($rssFeeds as $feed): echo ($html->link($feed['name'], 'http://' . $feed['url'], Array('class' => 'feed'))); endforeach;	?></div><?php	}	?>
	</div>

	<div id="ft" class="ft">
        <?php 
            echo $navigation->create(array(
                'Home' => '/',
                ucfirst(Configure::read('Wildflower.blogName')) => '/' . Configure::read('Wildflower.blogIndex'),
                'About' => '/about',
                'Contact' => '/contact'
            ), array('class' => 'tabs', 'liClass' => false));
        ?>

		<p class="quiet"><small>default theme &#124; Powered by <?php 
	           echo $html->link('<img src="/img/wildflower.png" />', 'http://wf.klevo.sk/', array(), false, false); ?> <a href="http://majic3.com/">icing <?php	echo Configure::read('Icing.version');	?></a>  &#124; <a href="http://cakephp.org/"><img src="/img/cake.power.gif" /></a> &#124; <a href="http://jquery.com/"><img src="/img/jquery-icon.png" /></a> &#124; <a href="http://github.com/stubbornella/oocss/">OO CSS</a></small></p>
		<?php	if ($isLogged and $this->params['action'] != 'wf_preview') echo '<p class="quiet"><small>', $this->element('admin_link'), '</small></p>';	?>
	</div>
</div>
</body>
</html>

