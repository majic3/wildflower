<?php 
    echo 
    $form->create('WildLink', array('url' => $here)),
    $form->input('name', array(
        'between' => '<br />',
        'tabindex' => '1',
        'div' => array('class' => 'input title-input'))),
    $form->input('url', array(
        'tabindex' => '2',
        'label' => 'Url',
        'between' => '<br />',
        'div' => array('class' => 'input'))),
    '<div>',
    $form->hidden('id'),
    '</div>',
    $form->submit('Publish'),
    $form->end();
?>