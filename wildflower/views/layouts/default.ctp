<?php echo $html->doctype('xhtml-strict'); ?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
    <?php echo $html->charset(); ?>
    
    <title><?php echo $title_for_layout; if(Configure::read('debug'))	{ echo " cake: " . Configure::version() . ";";  if(isset($this->theme)) { echo " theme: " . $this->theme; }	echo " Wildflower: " . Configure::read('Wildflower.version') . ";"; }	?></title>
    
    <meta name="description" content="<?php echo isset($descriptionMetaTag) ? $descriptionMetaTag : '' ?>" />
	<meta name="keywords" content="<?php echo isset($keywordsMetaTag) ? $keywordsMetaTag : '' ?>" />
	<!-- app/views default/layout -->
    
    <link rel="shortcut icon" href="<?php echo $this->webroot;?>favicon.ico" type="image/x-icon" />
    <link rel="alternate" type="application/rss+xml" title="<?php echo $siteName; ?> RSS Feed" href="<?php echo $html->url('/' . Configure::read('Wildflower.blogIndex') . '/rss'); ?>" />

    <?php
	
	if(isset($canonical['rel']['url']))	echo '<link rel="canonical" href="' . $canonical['rel']['url'] . "\" />\n";
	if(isset($canonical['rev']['id']))	echo '<link rev="canonical" href="' . $canonical['rev']['slug'] . "\" />\n";
		
	echo $html->css($styles, 'stylesheet', Array('media' => 'screen')); ?>
	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js" type="text/javascript"></script>
</head>
<?php echo ($wild) ? $wild->bodyTagWithClass($bdyClass) : '<body>'; ?>
<p id="umsg" class="alert">setting up page</p>
<div class="wildflower page liquid">
	<div id="hd" class="head">
		<img width="55" height="55" src="<?php e($html->url('/wildflower/img/logo-orb.png')); ?>" class="logo" alt="A CMS made with CakePHP"  />
		
		<div class="accessibility skipto"><a href="#bd">skip to content</a> &#124; <a href="/sitemap">sitemap</a></div>
		
		<h1><?php echo $html->link("<span>$title_for_layout</span>", '/', null, null, false) ?></h1>

		<div id="search" class="search"><?php echo $form->create("Dashboard",array('action' => 'search'));
			echo $form->input("query", array('label' => 'Search: '));
			echo $form->end('');
		?></div>

		<div class="nv">
			<?php $menu = ''; if($wild) echo $menu = $wild->menu('main_menu', false, 'tabs'); ?>
		</div>
	</div>


	<div id="bd" class="body">
		<!-- a name="bd"></a -->
		<?php echo $content_for_layout; ?>
	</div>

	<div id="ft" class="foot">
		<div class="leftCol">
			<p><?php echo $html->link($html->image('wildflower.png', array('alt' => 'Powered by Wildflower CMS', 'width' => '80', 'height' => '15')), 'http://wf.klevo.sk/', array(), false, false); ?> Wildflower Logo designed by <a href="http://www.olivertreend.com/">Oliver Treend</a></p>
			
			<?php echo $this->element('admin_link'); ?>
			<?php echo $this->element('debug_notice'); ?>
		</div>
		<div class="main">
			<div class="nv">
				<?php echo $menu; ?>
			</div>
			<div class="cake">
				<?php echo $html->image('cake.power.gif'); ?>
			</div>
		</div>
	</div>

</div>
<?php echo $this->element('google_analytics'); ?>
<script src="/js/LAB.js" type="text/javascript"></script>
<script type="text/javascript">
	$LAB
		.script("http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js").wait(function ()	{
			$('#umsg').removeClass('alert').addClass('notice').html('preparing page');
		})
		.script("/js/common.js").wait(function ()	{
			init();
		}).wait(function()	{
			var $umsg = $('#umsg');
			if($umsg.hasClass('success')) $umsg.fadeOut('slow').remove();
		});
</script>
</body>
</html>

