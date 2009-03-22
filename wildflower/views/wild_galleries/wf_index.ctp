<?php
	echo 
	$form->create('Gallery', array('url' => $html->url(array('action' => 'wf_mass_update', 'base' => false)))),
	$form->input('show', array(
	    'type' => 'select',
	    'options' => array(
	        'published' => 'Published',
	        'draft' => 'Not published (drafts)'
	    ),
	    'label' => 'Show ',
	    'div' => array('id' => 'show-galleries'),
	));
?>

<h2 class="section"><?php __('Galleries'); ?></h2>

<?php echo $this->element('wf_select_actions'); ?>

<ul class="list-of-galleries list">
    <?php foreach ($galleries as $gallery): ?>
        <li class="gallery-row actions-handle">
            <span class="row-check"><?php echo $form->checkbox('id.' . $gallery['WildGallery']['id']) ?></span>
            <?php
                $draftStatus = '';
                if ($gallery['WildGallery']['draft']) {
                    $draftStatus = '<abbr title="This gallery is not published, therefore not visible to the public." class="draft-status">(Draft)</abbr> ';
                }
            ?>
            <span class="title-row"><?php echo $draftStatus, $html->link($gallery['WildGallery']['name'], array('action' => 'wf_edit', $gallery['WildGallery']['id']), array('title' => __('Edit this gallery.', true))) ?></span>
            <span class="gallery-date"><?php echo $html->link($time->format('j M y', $gallery['WildGallery']['created']), array('action' => 'options', $gallery['WildGallery']['id']), array('title' => __('Change gallery options.', true))); ?></span>
            <span class="row-actions"><?php echo $html->link('View', WildGallery::getUrl($gallery['WildGallery']['slug']), array('class' => 'permalink', 'rel' => 'permalink', 'title' => __('View this gallery.', true))) ?></span>
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
        <?php echo $this->element('../wild_galleries/_sidebar_search'); ?>
    </li>
    <li><?php echo $html->link(
        '<span>' . __('Write a new gallery', true) . '</span>',
        array('action' => 'wf_create'),
        array('class' => 'add', 'escape' => false)) ?>
    </li>
<?php $partialLayout->blockEnd(); ?>