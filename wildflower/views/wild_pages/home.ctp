<?php
/**
 * Wildflower/Icing loads this template for home page.
 * Place any other templates for pages in this directory.
 *
 * You can overwrite this by placing a home.ctp file inside app/views/wild_pages/home.ctp
 *
 * @package wildflower
 */
/* todo: oo css */
?>
<div class="page"> 
    <div class="main">
    <h2><?php echo $page['WildPage']['title']; ?></h2>
       <?php echo $page['WildPage']['content']; ?>
    </div>
    <div class="sidebar">
       <?php echo $page['WildPage']['sidebar_content']; ?>
    </div>
    
    <?php echo $this->element('edit_this', array('id' => $page['WildPage']['id'])) ?>
</div>
