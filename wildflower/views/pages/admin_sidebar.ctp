<?php
    echo 
    $form->create('Page', array('url' => $html->url(array('action' => 'update', 'base' => false)), 'class' => 'horizontal-form')),
    '<div>',
    $form->hidden('id'),
    $form->hidden('draft'),
    '</div>';
?>

<h2 class="section">Reigions for <?php echo $html->link($this->data['Page']['title'], array('action' => 'edit', $this->data['Page']['id'])); ?></h2>

<div>
<h3>Sidebars</h3>
<?php

?>
</div>

<div>
<h3>Menus</h3>
<?php

?>
</div>

<div>
    <div class="submit save-section">
        <input type="submit" value="<?php __('Save as the newest version'); ?>" />
    </div>
    <div class="cancel-edit"> <?php __('or'); ?> <?php echo $html->link(__('Cancel', true), array('action' => 'edit', $this->data['Page']['id'])); ?></div>
</div>

<?php 
    echo 
    $form->end();
?>


<?php $partialLayout->blockStart('sidebar'); ?>
    <?php echo $this->element('../pages/_page_edit_right_menu'); ?>
<?php $partialLayout->blockEnd(); ?>