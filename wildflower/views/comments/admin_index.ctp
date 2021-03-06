<h2 class="section"><?php __('Comments'); ?></h2>

<?php
	echo 
	$form->create('Comment', array('action' => 'admin_mass_update', 'id' => 'comments_index'));
?>

<?php
    if (empty($comments)) {
        echo '<p>', __('No comments yet.', true), '</p>';
    } else {
        $actions = $this->element('admin_select_actions', array('actions' => $selectActions));

        echo 
        $actions,
        $tree->generate($comments, array('model' => 'Comment', 'class' => 'list comments-list', 'element' => '../comments/_index_list_item')),
        $actions;
    }
   
    echo $form->end();
?>


<?php $partialLayout->blockStart('sidebar'); ?>
    <li>
        <ul class="right_menu">
            <li><?php echo $htmla->link('Awaiting approval', array('action' => 'index'), array('strict' => false)); ?></li>
            <li><?php echo $htmla->link('Published', array('action' => 'index', 'published'), array('strict' => false)); ?></li>
            <li><?php echo $htmla->link('Spam', array('action' => 'index', 'spam'), array('strict' => false)); ?></li>
        </ul>
    </li>
<?php $partialLayout->blockEnd(); ?>


