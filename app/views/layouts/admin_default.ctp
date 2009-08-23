<?php
// at one stage the asset plugin required the following
// Configure::write('Asset.filter.cache', false);
// Configure::write('Asset.filter.css', false);
// Configure::write('Asset.filter.js', false);
echo $html->doctype('xhtml-strict') ?>
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
           // '/css/ui/jquery-ui-1.7.1',
            '/wildflower/css/wf.main'
        )),
        // TinyMCE 
        // @TODO load only on pages with editor?
        $javascript->link('/wildflower/js/tiny_mce/tiny_mce');
    ?>
     
    <!--[if lte IE 7]>
    <?php
        // CSS file for Microsoft Internet Explorer 7 and lower
        echo $html->css('/wildflower/css/wf.ie7');
    ?>
    <![endif]-->
    
    <!-- JQuery Light MVC -->
    <script type="text/javascript" src="<?php echo $html->url('/' . Configure::read('Routing.admin') . '/assets/jlm'); ?>"></script>
    <script type="text/javascript">
    //<![CDATA[
        $.jlm.config({
            base: '<?php echo $this->base ?>',
            controller: '<?php echo $this->params['controller'] ?>',
            action: '<?php echo $this->params['action'] ?>', 
            prefix: '<?php echo Configure::read('Routing.admin') ?>',
            custom: {
                wildflowerUploads: '<?php echo Configure::read('Wildflower.uploadsDirectoryName'); ?>'
            }
        });

		//	only load mce when theres content to edit -perhaps.  Add Googlie speller 
		//if($.jlm.config.action == 'edit')
			tinyMCE.init($.jlm.components.tinyMce.getConfig());

        $(function() {
           $.jlm.dispatch(); 
        });
    //]]>
    </script>
    
</head>
<body class="<?php if (isset($editorMode)) echo 'editor_mode'; echo	$this->params['controller']; ?>">

<div id="header">
	<div id="header-wrap">
<?php /*editor mode never gets set */ if (!isset($editorMode)): ?>    
	    <h1 id="site_title"><?php echo hsc($siteName); ?></h1>
	    <?php echo $html->link('Site index', '/', array('title' => __('Visit ', true)  . FULL_BASE_URL, 'id' => 'site_index')); ?>
	    
	    <div id="login_info">
	        <?php echo $htmla->link(__('Logout', true), array('controller' => 'users', 'action' => 'logout'), array('id' => 'logout')); ?> | <a href="#fulleditor" class="fulleditor">full</a>
	    </div>
	
	    <ul id="nav">
	        <li><?php echo $htmla->link(__('Dashboard', true), '/' . Configure::read('Routing.admin'), array('strict' => true)); ?></li>
	        <li><?php echo $htmla->link(__('Pages', true), array('controller' => 'pages', 'action' => 'index')); ?></li>
	        <li><?php echo $htmla->link(__('Modules', true), array('controller' => 'sidebars', 'action' => 'index')); ?></li>
	        <li><?php echo $htmla->link(__('Posts', true), array('controller' => 'posts', 'action' => 'index')); ?></li>
	        <li><?php echo $htmla->link(__('Categories', true), array('controller' => 'categories', 'action' => 'index')); ?></li>
	        <li><?php echo $htmla->link(__('Comments', true), array('controller' => 'comments', 'action' => 'index')); ?></li>
	        <li><?php echo $htmla->link(__('Messages', true), array('controller' => 'messages', 'action' => 'index')); ?></li>
	        <li><?php echo $htmla->link(__('Files', true), array('controller' => 'assets', 'action' => 'index')); ?></li>
	        <li class="nav_item_on_right"><?php echo $htmla->link(__('Users', true), array('controller' => 'users', 'action' => 'index')); ?></li>
	        <li class="nav_item_on_right"><?php echo $htmla->link(__('Site Settings', true), array('controller' => 'settings', 'action' => 'index')); ?></li>
	    </ul>
<?php else: ?>
		<ul id="editor_mode_header">
			<li><?php echo $html->link('Go to all pages', array('action' => 'index')); ?></li>
			<li><small>(Published at: <?php if (isset($publishedLink)) echo $publishedLink; ?>)</small></li>
			<li><a href="#fulleditor" class="fulleditor">full</a></li>
		</ul>
<?php endif; ?>
	</div>
</div><!-- /header-wrap -->

<div id="wrap">
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
    
    <?php if (isset($sidebar_for_layout)): ?>
    <div id="sidebar">
        <ul>
            <?php echo $sidebar_for_layout; ?>
        </ul>
    </div>
    <?php endif; ?>
        
    <div class="cleaner"></div>
</div>

</body>
</html>

