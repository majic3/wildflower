<?php
/**
 * Wildflower loads this template for home page.
 * Place any other templates for pages in this directory.
 *
 * @package wildflower
 */
?>
<div class="page">
    <div class="main">
	<?php echo $page['WildPage']['content']; ?>
	<?php echo $this->element('edit_this', array('id' => $page['WildPage']['id'])) ?>
    </div>
    <div class="aside">
       <?php echo $page['WildPage']['sidebar_content']; ?>
    </div>
</div>

