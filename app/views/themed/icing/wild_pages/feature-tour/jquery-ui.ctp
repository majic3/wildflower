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
       <?php echo $page['WildPage']['content']; ?>
    <?php echo $this->element('edit_this', array('id' => $page['WildPage']['id'])) ?>