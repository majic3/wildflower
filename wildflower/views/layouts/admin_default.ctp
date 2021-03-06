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
            '/wildflower/css/wf.main',
            '/tagging/css/tagging',
        )),
		$javascript->link('/wildflower/js/tiny_mce/tiny_mce');
    ?>
     
    <!--[if lte IE 7]>
    <?php
        // CSS file for Microsoft Internet Explorer 7 and lower
        echo $html->css('/wildflower/css/wf.ie7');
    ?>
    <![endif]-->
    
</head>
<body class="<?php echo	$this->params['controller'], ' ', $this->params['action']; ?>">
 
<div id="header">
    <h1 id="site_title"><?php echo hsc($siteName); ?></h1>
    <?php echo $html->link('Site index', '/', array('title' => __('Visit ', true)  . FULL_BASE_URL, 'id' => 'site_index')); ?>
    
    <div id="login_info">
        <a href="#" class="areaToggle" title="Click here to enable full view of content area (no sidebar)">Full</a> &#124; <?php echo $htmla->link(__('Logout', true), array('controller' => 'users', 'action' => 'logout'), array('id' => 'logout')); ?>
    </div>

	<ul id="nav">
		<li><?php echo $htmla->link(__('Dashboard', true), '/' . Configure::read('Routing.admin'), array('strict' => true)); ?></li>
		<li><?php echo $htmla->link(__('Pages', true), array('plugin' => null, 'admin' => true, 'prefix' => 'admin', 'controller' => 'pages', 'action' => 'index')); ?></li>
		<li><?php echo $htmla->link(__('Modules', true), array('plugin' => null, 'admin' => true, 'prefix' => 'admin', 'controller' => 'sidebars', 'action' => 'index')); ?></li>
		<li><?php echo $htmla->link(__('Posts', true), array('plugin' => null, 'admin' => true, 'prefix' => 'admin', 'controller' => 'posts', 'action' => 'index')); ?></li>
		<li><?php echo $htmla->link(__('Categories', true), array('plugin' => null, 'admin' => true, 'prefix' => 'admin', 'controller' => 'categories', 'action' => 'index')); ?></li>
		<li><?php echo $htmla->link(__('Comments', true), array('plugin' => null, 'admin' => true, 'prefix' => 'admin', 'controller' => 'comments', 'action' => 'index')); ?></li>
		<li><?php echo $htmla->link(__('Messages', true), array('plugin' => null, 'admin' => true, 'prefix' => 'admin', 'controller' => 'messages', 'action' => 'index')); ?></li>
		<li><?php echo $htmla->link(__('Assets', true), array('plugin' => null, 'admin' => true, 'prefix' => 'admin', 'controller' => 'assets', 'action' => 'index')); ?></li>
		<li><?php echo $htmla->link(__('Utilities', true), array('plugin' => null, 'admin' => true, 'prefix' => 'admin', 'controller' => 'utilities', 'action' => 'index')); ?></li>
		<li><?php echo $htmla->link(__('Sitemaps', true), array('plugin' => 'sitemap', 'admin' => true, 'prefix' => 'admin', 'controller' => 'sitemaps', 'action' => 'index')); ?></li>
		<li><?php echo $htmla->link(__('Tagging', true), array('plugin' => 'tagging', 'admin' => true, 'prefix' => 'admin', 'controller' => 'tags', 'action' => 'index')); ?></li>
		<li class="nav_item_on_right"><?php echo $htmla->link(__('Users', true), array('plugin' => null, 'admin' => true, 'prefix' => 'admin', 'users', 'action' => 'index')); ?></li>
		<li class="nav_item_on_right"><?php echo $htmla->link(__('Site Settings', true), array('plugin' => null, 'admin' => true, 'prefix' => 'admin', 'controller' => 'settings', 'action' => 'index')); ?></li>
	</ul>
</div><!-- /header -->

<div id="wrap">
	
	<?php if (isset($form_for_layout)) echo $form_for_layout; ?>
	
    <div id="content">
        <div id="co_bottom_shadow">
        <div id="co_right_shadow">
        <div id="co_right_bottom_corner">
        <div id="content_pad">
            <?php echo $content_for_layout; ?>
        </div>
        </div>
        </div>
        </div>
    </div>

	<div id="sysMsg" class="display">
		<?php
		// flash message
		if ($session->check('Message.flash')) {  
			$session->flash();
		}
		?>
	</div>
    
    <?php if (isset($sidebar_for_layout)): ?>
    <div id="sidebar">
        <ul>
            <?php echo $sidebar_for_layout; ?>
        </ul>
    </div>
    <?php endif; ?>

	<?php if (isset($form_for_layout)) echo '</form>'; ?>
        
    <div class="cleaner"></div>
</div>
    
    <!-- JQuery Light MVC - using LABjs to load jquery & ui from google jlm from wf then init -->
    <script type="text/javascript" src="/js/LAB.js"></script>
    <script type="text/javascript">
    //<![CDATA[
		$LAB.script("http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js")
		.script("http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/jquery-ui.min.js")
		.script("<?php echo $this->base ?>/<?php echo Configure::read('Routing.admin') ?>/assets/jlm").wait(function () {
			$.jlm.config({
				base: '<?php echo $this->base ?>',
				controller: '<?php echo $this->params['controller']; ?>',
				action: '<?php echo $this->params['action'] ?>', 
				model: '<?php echo ucfirst(Inflector::singularize($this->params['controller'])) ?>', 
				prefix: '<?php echo Configure::read('Routing.admin') ?>',
				custom: {
					wildflowerUploads: '<?php echo Configure::read('Wildflower.uploadsDirectoryName'); ?>',
					wildflowerMPreix: '<?php echo Configure::read('Wildflower.mediaRoute'); ?>'
				}
			});

			tinyMCE.init($.jlm.components.tinyMce.getConfig());

			$.jlm.dispatch(); 
		}).script('<?php	echo $tagging->getScript(true);	?>').wait(function () {
			setGlobalTags(['javascript', 'jquery', 'java', 'json']);
			<?php	echo $tagging->getScript();	?>
		});
    //]]>
    </script>

</body>
</html>

