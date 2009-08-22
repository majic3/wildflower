<?php
	App::import('Helper', 'TimeHelper');
	$time = new TimeHelper();
	echo 
    $form->create('WildShort', array('action' => 'mass_update'));
?>

<h2 class="section"><?php __('Short Urls'); ?></h2>

<?php echo $this->element('wf_select_actions', array('action' => 'delete')); ?>

<ul class="list">
    <?php foreach ($shorts as $short): ?>
        <li class="post-row actions-handle">
            <span class="row-check"><?php echo $form->checkbox('id.' . $short['WildShort']['id']) ?></span>
            <span class="title-row"><?php echo $html->link($short['WildShort']['slug'] . ' == ' . $short['WildShort']['url'] . ' / ' . $time->timeAgoInWords($short['WildShort']['created']), array('action' => 'wf_edit', $short['WildShort']['id']), array('title' => __('Edit this short account.', true))) ?></span>
            <span class="cleaner"></span>
        </li>
    <?php endforeach; ?>
</ul>

<?php
    echo
    $this->element('wf_select_actions', array('action' => 'delete')), 
	//$this->element('wf_pagination'),
    $form->end();
?>



<?php $partialLayout->blockStart('sidebar'); ?>
    <li class="sidebar-box">
        <h4 class="add"><?php __('Add a new short url'); ?></h4>
        <?php echo 
            $form->create('WildShort', array('action' => 'create')),
            $form->input('modelName', array('between' => '<br />')),
            $form->input('modelID', array('between' => '<br />')),
            $form->input('modelUrl', array('between' => '<br />')),
            $wild->submit('Create this short'),
            $form->end();
        ?>
    </li>
<?php $partialLayout->blockEnd(); ?>
    