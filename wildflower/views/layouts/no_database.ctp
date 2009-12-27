<?php echo $html->doctype('xhtml-strict') ?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
    <?php echo $html->charset(); ?>
    
    <title>[!] Database error &bull; Wildflower CMS</title>
    
    <link rel="icon" href="<?php echo $this->webroot;?>favicon.ico" type="image/x-icon" />
    <link rel="shortcut icon" href="<?php echo $this->webroot;?>favicon.ico" type="image/x-icon" />
	
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
<body>
<div class="wildflower page liquid">
	<div id="hd" class="head">
		<img width="55" height="55" src="<?php e($html->url('/wildflower/img/logo-orb.png')); ?>" class="logo" alt="A CMS made with CakePHP"  />
		
		<h1><?php echo $html->link("<span>$title_for_layout</span>", '/', null, null, false) ?></h1>
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
					<?php echo $html->link($html->image('cake.icon.png', array('alt' => 'the rapid development php framework', 'width' => '80', 'height' => '15')), 'http://cakephp.org/', array(), false, false); ?>
				</div>
				<div class="jquery">
					<?php echo $html->link($html->image('jquery-icon.png', array('alt' => 'jquery writeless do more', 'width' => '80', 'height' => '18')), 'http://jquery.com/', array(), false, false); ?>
				</div>
				<div class="wildflower">
					<?php echo $html->link($html->image('wildflower.png', array('alt' => 'Powered by Wildflower CMS', 'width' => '80', 'height' => '15')), 'http://wf.klevo.sk/', array(), false, false); ?>
				</div>
			</div>
		</div>
	</div>
</div>
</body>
</html>

