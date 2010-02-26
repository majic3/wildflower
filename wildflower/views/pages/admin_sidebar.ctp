<h2 class="section">Reigions for <?php echo $html->link($this->data['Page']['title'], array('action' => 'edit', $this->data['Page']['id'])); ?></h2>
<?php

	$opts = array('actions' => array('apply', 'unapply'));
	echo 
	$form->create('Page', array('action' => 'admin_update')),
    $this->element('admin_select_actions', $opts);

?>
<div>
<h3>Sidebars</h3>
<?php
	echo 
    $tree->generate($sidebars, array('model' => 'Sidebar', 'class' => 'list modules-list sidebars-list', 'element' => 'admin_sidebars_list_item'));
?>
</div>

<div>
<h3>Menus</h3>
<?php
	echo
    $tree->generate($menus, array('model' => 'Menu', 'class' => 'list modules-list menus-list', 'element' => 'admin_menus_list_item')),
    $this->element('admin_select_actions', $opts);
?>
</div>

<div>
    <div class="submit save-section">
        <input type="submit" value="<?php __('Save as the newest version'); ?>" />
    </div>
    <div class="cancel-edit"> <?php __('or'); ?> <?php echo $html->link(__('Cancel', true), array('action' => 'edit', $this->data['Page']['id'])); ?></div>
</div>

<?php
	
	echo $form->hidden('id', array('value' => $this->data['Page']['id'])),
	$form->hidden('_saveAll', array('value' => '1')),
	$form->end();
?>


<?php $partialLayout->blockStart('sidebar'); ?>
    <?php echo $this->element('../pages/_page_edit_right_menu'); ?>
<?php $partialLayout->blockEnd(); ?>