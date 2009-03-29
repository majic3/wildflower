<div id="content">
<?php 
    echo 
    $this->element('wild_galleries/form');
?>
</div>


<ul id="sidebar">
    <li>
        <ul class="sidebar-menu">
            <li><?php echo $html->link('Name, Params & Content', array('action' => 'wf_edit'), array('class' => 'current')); ?></li>
        </ul>
    </li>
    <li><?php echo $html->link(
        '<span>Create new Gallery</span>', 
        array('action' => 'add'),
        array('class' => 'add', 'escape' => false)) ?></li>
    <li>
        <?php
            echo
            $form->create('WildGallery'),
            $form->input('query', array('label' => __('Find a gallery by typing', true))),
            $form->end();
        ?>
    </li>
</ul>