<?php 
    echo 
    $form->create('WildPost', array('controller' => 'wild_posts', 'action' => 'create')),
    $form->input('title', array(
        'between' => '<br />',
        'tabindex' => '1',
        'div' => array('class' => 'input title-input'))),
    $form->input('content', array(
        'type' => 'textarea',
        'tabindex' => '2',
        'class' => 'tinymceLight',
        'rows' => '10',
        'label' => 'Content',
        'between' => '<br />',
        'div' => array('class' => 'input editor'))),
    '<div>',
    $form->hidden('id'),
    '</div>',
    $form->submit('Save as Draft'),
    $form->submit('Publish'),
    $form->end();
?>