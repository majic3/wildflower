<div id="content">
<?php 
    echo 
    $this->element('wild_links/form');
?>
</div>


<ul id="sidebar">
    <li>
        <ul class="sidebar-menu">
            <li><?php echo $html->link('Title & Content', array('action' => 'wf_edit'), array('class' => 'current')); ?></li>
            <li><?php echo $html->link('Categories', array('action' => 'wf_edit_categories')); ?></li>
        </ul>
    </li>
    <li><?php echo $html->link(
        '<span>Write a new link</span>', 
        array('action' => 'add'),
        array('class' => 'add', 'escape' => false)) ?></li>
    <li>
        <?php
            echo
            $form->create('WildLink'),
            $form->input('query', array('label' => __('Find a link by typing', true))),
            $form->end();
        ?>
    </li>
</ul>