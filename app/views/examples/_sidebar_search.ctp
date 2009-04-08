<?php
    echo
    $form->create('Example', array('url' => $html->url(array('action' => 'wf_search', 'base' => false)), 'class' => 'search')),
    $form->input('query', array('label' => __('Find a Example by typing', true), 'id' => 'SearchQuery')),
    $form->end();
?>