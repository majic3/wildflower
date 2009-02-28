<?php
	echo 
	$form->create('Link', array('url' => $html->url(array('action' => 'wf_mass_update', 'base' => false)))),
	$form->input('show', array(
	    'type' => 'select',
	    'options' => array(
	        'category' => 'From Category',
	    ),
	    'label' => 'Show ',
	    'div' => array('id' => 'show-links'),
	));
?>

<h2 class="section"><?php __('Links'); ?></h2>

<?php /*uses the user select actions element */ echo $this->element('wf_uselect_actions'); ?>

<ul class="list-of-links list">
    <?php foreach ($links as $link): ?>
        <li class="link-row actions-handle">
            <span class="row-check"><?php echo $form->checkbox('id.' . $link['WildLink']['id']) ?></span>
            <span class="title-row"><?php echo $html->link($link['WildLink']['name'], array('action' => 'wf_edit', $link['WildLink']['id']), array('title' => __('Edit this link.', true))) ?></span>
            <span class="link-date"><?php echo $html->link($time->format('j M y', $link['WildLink']['created']), array('action' => 'options', $link['WildLink']['id']), array('title' => __('Change link options.', true))); ?></span>
            <div class="link-categories">
            <?php
                // Link categories list
                $categories = Set::extract($link['WildCategory'], '{n}.title');
                if (!empty($categories)) {
                    $categories = join(', ', $categories);
                } else {
                    $categories = 'Uncategorized';
                }
                echo $html->link($categories, array('action' => 'categorize', $link['WildLink']['id']), array('title' => __('Categorize this link.', true)));
            ?>
            </div>
            <span class="row-actions"><?php echo $html->link('View', WildLink::getUrl($link['WildLink']['url']), array('class' => 'permalink', 'rel' => 'permalink', 'title' => __('View this link.', true))) ?></span>
            <span class="cleaner"></span>
        </li>
    <?php endforeach; ?>
</ul>

<?php
    echo
    $this->element('wf_uselect_actions'), 
	$this->element('wf_pagination'),
    $form->end();
?>


<?php $partialLayout->blockStart('sidebar'); ?>
    <li>
        <?php echo $this->element('../wild_links/_sidebar_search'); ?>
    </li>
    <li><?php echo $html->link(
        '<span>' . __('Write a new link', true) . '</span>',
        array('action' => 'wf_create'),
        array('class' => 'add', 'escape' => false)) ?>
    </li>
<?php $partialLayout->blockEnd(); ?>


    
