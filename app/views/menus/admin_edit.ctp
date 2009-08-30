<h2 class="section"><?php __('Editing menu'); ?></h2>

<?php $session->flash(); ?>

<?php
    echo
    $form->create('Menu', array('url' => $here, 'class' => 'generic_form')),
    $form->input('id', array('type' => 'hidden')),
    $form->input('title', array('after' => $html->tag('p', __('(does not show anywhere, it\'s for your reference)', true))));
?>

<h3>Menu items</h3>
<ul class="menu_items">
    <?php 
	if(!empty($this->data['MenuItem'])):
	foreach ($this->data['MenuItem'] as $i => $item): ?>
    <li>
        <?php echo $form->input("MenuItem.$i.label", array('div' => array('class' => 'menu_item_label'))); ?>
        <?php echo $form->input("MenuItem.$i.url", array('div' => array('class' => 'menu_item_url'))); ?>
        <?php echo $form->input("MenuItem.$i.id", array('type' => 'hidden')); ?>
        <?php echo $html->link(__('Remove', true), array('action' => 'delete', 'controller' => 'menu_items', $item['id']), array('class' => 'delete')); ?>
        <a class="move" href="#DragAndDropItem"><span>Move</span></a>
    </li>
    <?php endforeach;
	else: 
	?>
    <li>
        <?php echo $form->input("MenuItem.0.label", array('div' => array('class' => 'menu_item_label', 'value' => 'New Menu Item'))); ?>
        <?php echo $form->input("MenuItem.0.url", array('div' => array('class' => 'menu_item_url', 'value' => 'New Url'))); ?>
        <?php echo $form->input("MenuItem.0.id", array('type' => 'hidden')); ?>
        <a class="move" href="#DragAndDropItem"><span>Move</span></a>
    </li><?php
	endif;
	?>
</ul>
    
<p class="add_menu_item_p"><?php echo $html->link(__('Add item', true), '#AddMenuItem', array('id' => 'add_menu_item')); ?></p>


<?php echo $form->end('Save changes'); ?>

<div class="cancel-edit"> <?php __('or'); ?> <?php echo $html->link(__('Cancel', true), array('action' => 'index', 'controller' => 'sidebars')); ?></div>

<?php $partialLayout->blockStart('sidebar'); ?>
 
<?php $partialLayout->blockEnd(); ?>
