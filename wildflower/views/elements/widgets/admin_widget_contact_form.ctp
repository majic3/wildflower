<h2 class="section"><?php __('Editing Widget Contact Form'); ?></h2>

<?php $session->flash(); ?>

<?php
    echo
    $form->create('Widget', array('url' => $here, 'class' => 'generic_form')),
    $form->input('id', array('type' => 'hidden'));
?>

<h3>Menu items</h3>
<ul class="menu_items">
	<?php	
		foreach ($data['Widget']['items'] as $item) {
			$cell = $html->link($item['label'], $item['url']);
			if (empty($item['url'])) {
				$cell = '<span class="no_link">' . hsc($item['label']) . '</span>';
			}
			echo '<li>', $cell, '</li>';
		}

		foreach ($this->data['MenuItem'] as $i => $item): ?>
    <li>
        <?php echo $form->input("MenuItem.$i.label", array('div' => array('class' => 'menu_item_label'))); ?>
        <?php echo $form->input("MenuItem.$i.url", array('div' => array('class' => 'menu_item_url'))); ?>
        <?php echo $form->input("MenuItem.$i.id", array('type' => 'hidden')); ?>
        <?php echo $html->link(__('Remove', true), array('action' => 'delete', 'controller' => 'menu_items', $item['id']), array('class' => 'delete')); ?>
        <a class="move" href="#DragAndDropItem"><span>Move</span></a>
    </li>
    <?php endforeach; ?>
</ul>
    
<p class="add_menu_item_p"><?php echo $html->link(__('Add item', true), '#AddMenuItem', array('id' => 'add_menu_item')); ?></p>


<?php echo $form->end('Save changes'); ?>

<div class="cancel-edit"> <?php __('or'); ?> <?php echo $html->link(__('Cancel', true), array('action' => 'index', 'controller' => 'sidebars')); ?></div>

<p><?php
	//	use refer to set link echo $html->link();
?></p>