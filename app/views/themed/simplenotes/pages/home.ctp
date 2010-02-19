<?php
/**
 * Wildflower/Simplenotes loads this template for home page.
 * Place any other templates for pages in this directory.
 *
 * @package wildflower
 */
if($sidebar['sidebar'] !== array()):	?>
<div class="rightCol">
	<?php //echo $wild->menu('Branches', false, 'tabs', '<div class="nv vert">%s</div>');
	
	echo $wild->processSidebar($sidebar['sidebar']);?>
</div>
<?php endif; ?>
<div class="main">
    <h2><?php echo $page['Page']['title']; ?></h2>
       <?php echo $page['Page']['content']; ?>
    <?php echo $this->element('edit_this', array('id' => $page['Page']['id'])) ?>
</div>

