<?php echo $html->doctype('xhtml-strict'); ?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
    <?php echo $html->charset(); ?>
    
    <title><?php echo $title_for_layout; if(Configure::read('debug'))	{	echo " cake: " . Configure::version() . ";";  if(isset($this->theme)) echo " theme: " . $this->theme;	echo " Wildflower: " . Configure::read('Wildflower.version') . ";";	}	?></title>
    
	<meta name="description" content="<?php echo isset($pageMeta['descriptionMetaTag']) ? $pageMeta['descriptionMetaTag'] : Configure::read('Wildflower.settings.description'); ?>" />
	<meta name="keywords" content="<?php echo isset($pageMeta['keywordsMetaTag']) ? $pageMeta['keywordsMetaTag'] : Configure::read('Wildflower.settings.keywords'); ?>" />
	<!-- theme/wildflower default/layout -->
    
    <link rel="shortcut icon" href="<?php echo $this->webroot;?>favicon.ico" type="image/x-icon" />
    <link rel="alternate" type="application/rss+xml" title="<?php echo $siteName; ?> RSS Feed" href="<?php echo $html->url('/feed.rss'); ?>" />

    <?php
	
	if(isset($canonical['rel']))	echo '<link rel="canonical" href="' . $canonical['rel'] . "\" />\n";
	if(isset($canonical['rev']['id']))	echo '<link rev="canonical" href="' . $canonical['rev']['slug'] . "\" />\n";

		$simplenotesStyles = array(
			'simplenotes/screen'
		);
	echo $html->css($simplenotesStyles, 'stylesheet', Array('media' => 'screen'), true);
	// array('css_alt', Array('attribs' => array('media' => 'print'), 'rel' => 'stylesheet', 'css' => 'print'));
	
		$javascripts = array(
			'plugins/jquery.gatracker', 
			'plugins/jquery.tipsy', 
			'common'
		);
		$javascript->link($javascripts, false);
	?>
</head>
<?php echo ($wild) ? $wild->bodyTagWithClass() : '<body>'; ?>
<p id="umsg" class="alert">setting up page</p>

<div id="wrapper">


	<div id="miniwrapper">
			<a id="rsslink" href="<?php echo $html->url('/feed.rss'); ?>" title="<?php echo $siteName; ?> Subscribe via RSS">Subscribe via RSS</a>
					<div id="wrapsearch">
						<?php echo $this->element('search_form'); ?>
					</div>
		<div class="clear"></div>
	</div>






	<div id="subcontainer1">

	<!-- header -->
		<div id="header">
				<h1><?php echo $html->link($title_for_layout, '/', null, null, false) ?></h1>
				<h2><?php echo $descriptionMetaTag; ?></h2>
				<?php echo $wild->menu('main_menu', false, 'tabs', '<div id="nv">%s</div>'); ?>
			<div class="clear"></div>
		</div>
	<!-- /header --><!-- sidebar -->

<div id="sidebar">
	<ul>

<!-- latest posts -->
		<li>
			<h2>Latest posts</h2>
 				<?php
					//echo $wild->latestCommentsList();
				?>
		</li>
<!-- /latest posts -->

<!-- tags -->
		<li>
			<h2>Tag cloud</h2>
				<div class="widget widget_tag_cloud">
					<p></p>
				</div>
		</li>
<!-- /tags -->

		<?php	
			//echo $wild->postsFromCategory();
		?>

<!-- monthly -->
		<li>
			<h2>Monthly</h2>
				<ul>
					<li>monthly stuff</li>
				</ul>
		</li>
<!-- /monthly -->

<!-- category -->
		<li>
			<h2>Category</h2>
				<?php // echo $wild->catTree(); ?>
		</li>
<!-- /category -->

<!-- meta -->
		<li>
			<h2>Meta</h2>
				<ul>
					<li><?php echo $this->element('admin_link'); ?></li>
					<li><a href="<?php echo $html->url('/feed.rss'); ?>" title="Syndicate this site using RSS"><abbr title="Really Simple Syndication">RSS</abbr></a></li>
					<li><a href="http://validator.w3.org/check/referer" title="This page validates as XHTML 1.0 Transitional">Valid <abbr title="eXtensible HyperText Markup Language">XHTML</abbr></a></li>
					<li><a href="http://jigsaw.w3.org/css-validator/check/referer">Valid <abbr title="Cascading Style Sheet">CSS</abbr></a></li>
					<li><a href="http://wf.klevo.sk/" title=""><abbr title="Wildflower">WF</abbr></a></li>
				</ul>
		</li>
<!-- /meta -->

	</ul>
</div>

<!-- /sidebar -->

	</div>

	<div id="subcontainer2">
		<div class="entries">
		<?php echo $content_for_layout; ?>


	<div class="navigation">
		<?php //posts_nav_link(' - ', '&laquo; Latest posts', 'Previous posts &raquo;'); ?>
	</div>

		</div>
	</div>

<div class="clear"></div>

	<div id="footer">
				<!-- If you'd like to support WordPress, having the "powered by" link someone on your blog is the best way, it's our only promotion or advertising. -->
					<a id="logo" href="http://wf.klevo.sk/" title="Powered by Wildflower a CakePHP CMS">Wildflower</a>
			<div id="copyright">
					<p>Wildflower Logo designed by <a href="http://www.olivertreend.com/">Oliver Treend</a> Simplenotes theme by <a href="http://unexpected.org/">unexpected.org</a> converted to wildflower by <a href="http://majic3.com">Majic3</a></p>
					<p>
						&#169; <a href="#"><strong><?php echo "blog name"; ?></strong></a> All Rights Reserved<br />
						Simplenotes 1.3 by <a href="http://unexisted.org" title="Unexisted.org"><strong>Carla Izumi Bamford</strong></a><br />
						<a href="#" title="Syndicate this site using RSS"><abbr title="Really Simple Syndication">RSS</abbr></a> | 
						<a href="#" title="The latest comments to all posts in RSS">Comments <abbr title="Really Simple Syndication">RSS</abbr></a> | 
						<a href="http://validator.w3.org/check/referer" title="This page validates as XHTML 1.0 Transitional">Valid <abbr title="eXtensible HyperText Markup Language">XHTML</abbr></a> | 
						<a href="http://jigsaw.w3.org/css-validator/check/referer">Valid <abbr title="Cascading Style Sheet">CSS</abbr></a>
					</p>
				<!-- <?php //echo get_num_queries(); ?> queries. <?php //timer_stop(1); ?> seconds. -->
			</div>
			<?php echo $this->element('debug_notice'); ?>
		<div class="clear"></div>

	</div>

</div>
<?php
	if($tagging)
		$tagScript = $tagging->getScript(true);

	$javascript->link(array('common', $tagScript), false);
	
	if($labjs)	{
		$labjs->addWait('http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js',		'$(\'#umsg\').removeClass(\'alert\').addClass(\'notice\').html(\'preparing page\');'
		);
		
		//	$labjs->addWait($swfobject->script, $swfobject->getInitScript());

		$labjs->addWait(
			'common',
			'init();'
		);
		
		$tagOptions = array(
			'url' => '/tagging/tags/suggest',
			'delay' => 500,
			'separator' => ', ',
			'matchClass' => 'tagMatches',
			'sort' => false,
			'tagContainer' => 'span',
			'tagWrap' => 'span',
			'tags' => null,
		);
		
		$labjs->addWait(
			$tagScript,
			'$(".tagSuggest").tagSuggest(' . $javascript->object($tagOptions) . ');'
		);
		
		// debug($labjs);

		$endWait = '
			var $umsg = $(\'#umsg\');
			if($umsg.hasClass(\'success\')) $umsg.fadeOut(\'slow\').remove();';

		echo 
			$this->element('google_analytics'), 
			$labjs->output($endWait);
	} ?>
</body>
</html>

