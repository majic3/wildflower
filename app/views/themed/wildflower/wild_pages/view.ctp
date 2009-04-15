<?php
/**
 * Wildflower/Icing loads this template for home page.
 * Place any other templates for pages in this directory.
 *
 * You can overwrite this by placing a home.ctp file inside app/views/wild_pages/home.ctp
 *
 * @package wildflower
 */
if($page['WildPage']['sidebar_content']): echo "<strong>is sidebar content</strong>"
?>
<div class="leftCol">
<?php	echo $wild->processWidgets($page['WildPage']['sidebar_content']); ?>
</div><?php
endif;
?>
<div class="main">
    <h2><?php echo $page['WildPage']['title']; ?></h2>
    
    <div class="entry">
       <?php echo $wild->processWidgets($page['WildPage']['content'])); ?> 
    </div>
    
    <?php echo $this->element('edit_this', array('id' => $page['WildPage']['id'])) ?>
</div>
