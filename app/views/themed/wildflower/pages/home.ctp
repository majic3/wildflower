<?php
/**
 * Wildflower/Icing loads this template for home page.
 * Place any other templates for pages in this directory.
 *
 * You can overwrite this by placing a home.ctp file inside app/views/wild_pages/home.ctp
 *
 * @package wildflower
 */
if($page['Sidebar'] !== array()):	?>
<div class="rightCol">
	<?php echo $wild->menu('Branches', false, 'tabs', '<div class="nv vert">%s</div>');
	
	echo $wild->processSidebar($page['Sidebar']);?>
</div>
<?php endif; ?>
<div class="main">
    <h2><?php echo $page['Page']['title']; ?></h2>
       <?php echo $page['Page']['content']; ?>
    <?php echo $this->element('edit_this', array('id' => $page['Page']['id'])) ?>
</div>

