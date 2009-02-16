<?php 
    $session->flash();
    
    echo 
    $form->create('WildGallery', array('url' => $html->url(array('action' => 'wf_update', 'base' => false)), 'class' => 'editor-form'));
?>

<div id="title-content">
    <?php
        echo
        $form->input('name', array(
            'between' => '<br />',
            'tabindex' => '1',
            'label' => __('Gallery title', true),
            'div' => array('class' => 'input title-input'))),
        $form->hidden('id'),
        $form->hidden('draft'),
        '</div>';
    ?>
    
    <div id="edit-buttons">
        <?php echo $this->element('wf_edit_buttons'); ?>
    </div>
</div> 


<?php echo $form->end(); ?>
    

<?php $partialLayout->blockStart('sidebar'); ?>
    <li>
        <?php echo $this->element('../wild_galleries/_sidebar_search'); ?>
    </li>
    <li>
        <?php echo $html->link(
            '<span>Create new Gallery</span>', 
            array('action' => 'wf_create'),
            array('class' => 'add', 'escape' => false)); ?>
    </li>
    <li>
        <ul class="sidebar-menu-alt edit-sections-menu">
            <li><?php echo $html->link('Options <small>like status, publish date, etc.</small>', array('action' => 'options', $this->data['WildGallery']['id']), array('escape' => false)); ?></li>
        </ul>
    </li>
    <li class="sidebar-box post-info">
        <?php echo $this->element('../wild_galleries/_gallery_info'); ?>
    </li>
<?php $partialLayout->blockEnd(); ?>