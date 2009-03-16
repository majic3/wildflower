<?php echo $html->doctype('xhtml-strict') ?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
    <?php echo $html->charset(); ?>
    
    <title><?php echo $title_for_layout; ?></title>
    
    <meta name="description" content="" />
    
    <link rel="icon" href="<?php echo $this->webroot;?>favicon.ico" type="image/x-icon" />
    <link rel="shortcut icon" href="<?php echo $this->webroot;?>favicon.ico" type="image/x-icon" />
    
    <?php echo $html->css(Array('login')); ?>
    
</head>
<body>

	<div id="floater"></div>
	<div id="centered">


<div id="floater"></div>

<div id="header">
	<h1 id="site-title">
		<?php echo $html->link($siteName, '/', array('title' => 'View site home page')) ?>
	</h1>
</div>
<div id="content">
	<?php echo $content_for_layout; ?>
</div>
</div>

<p id="footer">
    <?php echo $html->link('Powered by Wildflower', 'http://wf.klevo.sk/') ?> &#124; 
    <?php echo $html->link('Silk Icons by Mark@Famfamfam', 'http://www.famfamfam.com/lab/icons/silk/') ?> &#124; 
    <?php echo $html->link('Bright Icons by Min@Icon Eden', 'http://www.iconeden.com/icon/bright-free-stock-iconset.html') ?>
</p>
</body>
</html>
