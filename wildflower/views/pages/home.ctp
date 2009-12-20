<?php
/**
 * Wildflower generic page template.
 *
 * @package wildflower
 */
?>
<div class="rightCol">
	<?php echo $this->element('latest_posts', array('categorySlug'=>'action','categoryLimit'=>4));  ?>
</div>
<div class="main">
	<h2><?php echo $page['Page']['title']; ?></h2>

	<div class="entry">
	   <?php echo $page['Page']['content']; ?>
	</div>

	<?php echo $this->element('edit_this', array('id' => $page['Page']['id'])) ?>
</div>

