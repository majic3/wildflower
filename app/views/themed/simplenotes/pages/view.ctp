<?php
/**
 * Wildflower generic page template.
 *
 * @package wildflower
 */

/*
	plan to allow users the ability to set sidebar location via page params
	possible plan to allow sidebars to be set sidebar or aside (these might not be sidebars per see)
	not really going to set it hard and fast how its coded but sidebars would need params too

	the template helper merged into wild helper needs to be altered to use widgets and be able to 
	pick a widget or place one with data set via controller ie being able to pass it array data not 
	possible with adhoc code from bakery
*/
?>
<div class="leftCol">
    <div class="nv vert">
	<h5>page sub nav</h5>
       <?php echo $wild->subPageNav(); ?>
    </div>
	<p>sidebar items</p>
<?php	
	if(!empty($page['Sidebar'])):
	echo $wild->processSidebar($page['Sidebar']);
	endif; ?>
</div><?php

if(!empty($sidebar['aside'])): 
?>
<div class="rightCol">
<?php	echo $wild->processSidebar($sidebar['aside']); ?>
</div><?php
endif;
?>
<div class="main">
    <h2><?php echo $page['Page']['title']; ?></h2>
    <?php echo $page['Page']['content']; ?>
    <?php echo $this->element('edit_this', array('id' => $page['Page']['id'])) ?>
</div>