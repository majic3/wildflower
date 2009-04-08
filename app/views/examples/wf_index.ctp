<?php
	echo 
	$form->create('Example', array('url' => $html->url(array('action' => 'wf_mass_update', 'base' => false)))),
	$form->input('show', array(
	    'type' => 'select',
	    'options' => array(
	        'active' => 'Active',
	        'inactive' => 'Inactive',
	    ),
	    'label' => 'Show ',
	    'div' => array('id' => 'show-examples'),
	));
?>

<h2 class="section"><?php __('Example'); ?></h2>

<?php echo $this->element('wf_select_actions'); ?>


<ul class="list-of-examples list">
    <?php foreach ($examples as $example): ?>
        <li class="example-row actions-handle">
            <span class="row-check"><?php echo $form->checkbox('id.' . $example['Example']['id']) ?></span>
            <?php
                $activeStatus = '';
                if (!$example['Example']['active']) {
                    $draftStatus = '<abbr title="This example is not active, therefore not visible to the public." class="draft-status">(inactive)</abbr> ';
                }
            ?>
            <span class="title-row"><?php echo $activeStatus, $html->link($example['Example']['title'], array('action' => 'wf_edit', $example['Example']['id']), array('title' => __('Edit this Example.', true))) ?></span>
            <span class="example-date"><?php echo $html->link($time->format('j M y', $example['Example']['created']), array('action' => 'options', $example['Example']['id']), array('title' => __('Change example options.', true))); ?></span>
            <span class="row-actions"><?php echo $html->link('View', '/examples/view/' . $example['Example']['slug'], array('class' => 'permalink', 'rel' => 'permalink', 'title' => __('View this example.', true))) ?></span>
            <span class="cleaner"></span>
        </li>
    <?php endforeach; ?>
</ul>

<?php
    echo
    $this->element('wf_select_actions'), 
	$this->element('wf_pagination'),
    $form->end();
?>


<?php $partialLayout->blockStart('sidebar'); ?>
    <li>
        <?php echo $this->element('../examples/_sidebar_search'); ?>
    </li>
    <li><?php echo $html->link(
        '<span>' . __('Write a new Example', true) . '</span>',
        array('action' => 'wf_create'),
        array('class' => 'add', 'escape' => false)) ?>
    </li>
<?php $partialLayout->blockEnd(); ?>