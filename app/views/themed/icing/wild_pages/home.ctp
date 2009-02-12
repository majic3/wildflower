<?php
/**
 * Wildflower loads this template for home page.
 * Place any other templates for pages in this directory.
 *
 * You can overwrite this by placing a home.ctp file inside app/views/wild_pages/home.ctp
 *
 * @package wildflower
 */
?>
<div class="page"> 
    <div id="introduction" class="entry">
    <h2><?php echo $page['WildPage']['title']; ?></h2>
       <?php echo $page['WildPage']['content']; ?>
    </div>
    <div id="resources" class="entry">
       <?php echo $page['WildPage']['sidebar_content']; ?>
    </div>
    
    <?php echo $this->element('edit_this', array('id' => $page['WildPage']['id'])) ?>
</div>
