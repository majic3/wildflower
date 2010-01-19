<?php echo $html->doctype('xhtml-strict') ?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
    <?php echo $html->charset(); ?>
	
	<title><?php echo $title_for_layout; ?></title>
	
	<meta name="description" content="" />
	
    <link rel="shortcut icon" href="<?php echo $this->webroot; ?>favicon.ico" type="image/x-icon" />
	
	<?php 
        echo
        // Load your CSS files here
        $html->css(array(
            'screen',
        ));
    ?>
     
    <!--[if lte IE 7]>
    <?php
        // CSS file for Microsoft Internet Explorer 7 and lower
        echo $html->css('/wildflower/css/wf.ie7');
    ?>
    <![endif]-->
    
</head>
<?php echo ($wild) ? $wild->bodyTagWithClass() : '<body>'; ?>
<div class="wildflower page liquid">
	<div id="hd" class="head">
		<img width="55" height="55" src="<?php e($html->url('/wildflower/img/logo-orb.png')); ?>" class="logo" alt="A CMS made with CakePHP"  />
		
		<div class="accessibility"><span class="skipto"><a href="#bd">skip to content</a></span> &#124; <a href="/sitemap">sitemap</a> &#124; <a href="/help">help</a> &#124; <a href="/options">options</a> &#124; <a href="/search">adv search</a></div>

		<div class="rss">
			<a title="<?php echo $siteName; ?> RSS Feed" href="<?php echo $html->url('/rss'); ?>"><img src="<?php e($html->url('/img/feed.png')); ?>" alt="Site Feed in RSS Format"  /></a>
		</div>
		
		<h1><?php echo $html->link("<span>$title_for_layout</span>", '/', array('escape' => false), null) ?></h1>

		<div id="search" class="search"><?php echo $form->create("Dashboard",array('action' => 'search', 'type' => 'get'));
			echo $form->label("q", "search");
			echo $form->text("q");
			echo $form->submit("go.gif", array('id' => 'go', 'div' => false));
			echo $form->end(null);
		?></div>

		<div class="nv">
			<?php $menu = ''; if($wild) echo $menu = $wild->menu('main_menu', array('class' => 'tabs')); ?>
		</div>
	</div>


	<div id="bd" class="body">
		<!-- a name="bd"></a -->
		<?php echo $content_for_layout; ?>
	</div>

	<div id="ft" class="foot">
		<div class="leftCol">
			<?php echo $credits ? $this->element('credits', compact('credits')):'' ?>
			
			<?php echo $this->element('admin_link'); ?>
			<?php echo $this->element('debug_notice'); ?>
		</div>
		<div class="main">
			<div class="nv">
				<?php echo $menu; ?>
			</div>
			<div class="logos">
				<div class="cake">
					<?php echo $html->link($html->image('cake.power.gif', array('alt' => 'the rapid development php framework', 'width' => '80', 'height' => '15')), 'http://cakephp.org/', array('escape' => false), false); ?>
				</div>
				<div class="jquery">
					<?php echo $html->link($html->image('jquery-icon.png', array('alt' => 'jquery writeless do more', 'width' => '80', 'height' => '18')), 'http://jquery.com/', array('escape' => false), false); ?>
				</div>
				<div class="wildflower">
					<?php echo $html->link($html->image('wildflower.png', array('alt' => 'Powered by Wildflower CMS', 'width' => '80', 'height' => '15')), 'http://wf.klevo.sk/', array('escape' => false), false); ?>
				</div>
			</div>
		</div>
	</div>
</div>
<?php echo $this->element('google_analytics'); ?>
<script src="/js/LAB.js" type="text/javascript"></script>
<script type="text/javascript">
	$LAB
		.script("http://ajax.googleapis.com/ajax/libs/jquery/1.4/jquery.min.js").wait(function ()	{
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