<?php 
    $session->flash();
    
    echo 
    $form->create('WildLink', array('url' => $html->url(array('action' => 'wf_update', 'base' => false)), 'class' => 'editor-form'));
?>

<div id="title-content">
    <?php
        echo
        $form->input('name', array(
            'between' => '<br />',
            'tabindex' => '1',
            'label' => __('Link Name', true),
            'div' => array('class' => 'input title-input'))),
        $form->input('url', array(
            'tabindex' => '2',
            'label' => __('Url', true),
            'div' => array('class' => 'input'))),
        '<div>',
        $form->hidden('id'),
        '</div>';
    ?>
    
    <div id="edit-buttons">
        <?php echo $this->element('wf_edit_buttons'); ?>
    </div>
</div> 

    <div class="cancel-edit cancel-section"><?php echo $html->link(__('Go back to link edit', true), '#Cancel'); ?></div>
</div>

<?php echo $form->end(); ?>
    

<?php $partialLayout->blockStart('sidebar'); ?>
    <li>
        <?php echo $this->element('../wild_links/_sidebar_search'); ?>
    </li>
    <li>
        <?php echo $html->link(
            '<span>Write a new link</span>', 
            array('action' => 'wf_create'),
            array('class' => 'add', 'escape' => false)); ?>
    </li>
    <li>
        <ul class="sidebar-menu-alt edit-sections-menu">
            <li><?php echo $html->link('Categorize this link', array('action' => 'categorize', $this->data['WildLink']['id'])); ?></li>
            <!-- li><?php //	put a thing to toggle activity of links as status 	echo $html->link('Options <small>like status, publish date, etc.</small>', array('action' => 'options', $this->data['WildLink']['id']), array('escape' => false)); ?></li -->
        </ul>
    </li>
    <li class="sidebar-box link-info">
        <?php echo $this->element('../wild_links/_link_info'); ?>
    </li>
<?php $partialLayout->blockEnd(); ?>
