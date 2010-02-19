<?php
/**
 * Wildflower generic page template.
 *
 * @package wildflower
 */
?>
<?php
if(isset($aside_for_layout)): ?>
	<div class="leftCol">
	<?php echo $aside_for_layout; ?>
	</div>
<?php endif; ?>
<div class="rightCol">
	<div class="line">
		<div class="unit size1of1">
			<?php echo $this->element('latest_posts');  ?>
		</div>
		<div class="unit size1of2">
			<h3>Latest Comments</h3>
			<?php echo $wild->menu('latestComments', array());  ?>
		</div>
		<div class="lastUnit size1of2">
			<h3>Categories</h3>
			<?php echo $wild->menu('dynamicCats', array());  ?>
		</div>
	</div>
	<?php if(isset($sidebar_for_layout)) echo $sidebar_for_layout;  ?>
</div>
<div class="main">
	<h2><?php echo $page['Page']['title']; ?></h2>

	<div class="entry">
		<?php echo $page['Page']['content']; ?>
	</div>

	<?php echo $this->element('edit_this', array('id' => $page['Page']['id'])) ?>
</div>

