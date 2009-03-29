<?php
    echo
    $form->create('WildGallery', array('url' => $html->url(array('action' => 'wf_search', 'base' => false)), 'class' => 'search')),
    $form->input('query', array('label' => __('Find a gallery by typing', true), 'id' => 'SearchQuery')),
    $form->end();
?>