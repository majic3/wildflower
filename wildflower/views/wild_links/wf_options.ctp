<?php 
    echo 
    $form->create('WildLink', array('url' => $html->url(array('action' => 'update', 'base' => false)), 'class' => 'horizontal-form')),
    '<div>',
    $form->hidden('id'),
    '</div>';
?>

<h2 class="section">Link Options</h2>
<?php
    echo 
    $form->input('slug', array('label' => 'URL slug', 'size' => 61)),
    $form->input('created', array());
?>

<div class="horizontal-form-buttons">
    <div class="submit save-section">
        <input type="submit" value="<?php __('Save options'); ?>" />
    </div>
    <div class="cancel-edit"> <?php __('or'); ?> <?php echo $html->link(__('Cancel and go back to link edit', true), array('action' => 'edit', $this->data['WildLink']['id'])); ?></div>
</div>

<?php echo $form->end(); ?>

<p class="link-info">
	<?php echo $html->link(FULL_BASE_URL . $this->base . $link['WildLink']['name'], $link['WildLink']['url']); ?> has been updated.
</p>


<?php $partialLayout->blockStart('sidebar'); ?>
    <li class="sidebar-box">
        <h4>Editing options for link...</h4>
        <?php echo $html->link($this->data['WildLink']['name'], array('action' => 'edit', $this->data['WildLink']['id']), array('class' => 'edited-item-link')); ?>
    </li>
<?php $partialLayout->blockEnd(); ?>