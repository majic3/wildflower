

<h2 class="section"><?php __('Statistics'); ?></h2>

<?php echo $this->element('wf_select_actions'); ?>

<ul class="list-of-links list">
    <?php foreach ($WildStats as $WildStat): ?>
        <li class="link-row actions-handle">
            <span class="row-check"><?php echo $form->checkbox('id.' . $WildStat['WildStat']['id']) ?></span>
            <!-- span class="row-actions"><?php echo $html->link('View', 'view/' . $WildStat['WildStat']['id'], array('title' => __('View this link.', true))) ?></span -->
            <span class="row-actions"><a href="<?php	echo '/wf/stats/view/' . $WildStat['WildStat']['id'];	?>" 'title="View this link.">View</a></span>
			<?php	echo $WildStat['WildStat']['title']	?>
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
        <?php echo $this->element('../wild_stats/_sidebar_quicklinks'); ?>
    </li>
    <li><?php echo $html->link(
        '<span>' . __('Write a new link', true) . '</span>',
        array('action' => 'wf_create'),
        array('class' => 'add', 'escape' => false)) ?>
    </li>
<?php $partialLayout->blockEnd(); ?>