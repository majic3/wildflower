<?php
/**
 * Wildflower loads this template for home page.
 * Place any other templates for pages in this directory.
 *
 * @package wildflower
 */
?>
<div class="page">
    <div id="introduction" class="entry">
       <?php echo $page['WildPage']['content']; ?>
    </div>
    <div id="resources" class="entry">
       <?php echo $page['WildPage']['sidebar_content']; ?>
    </div>
    
    <?php echo $this->element('edit_this', array('id' => $page['WildPage']['id'])) ?>
</div>	 <p>test this</p>

