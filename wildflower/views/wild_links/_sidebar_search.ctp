<?php

	// could find by typing be a reusable core part of wf

    echo
    $form->create('WildLink', array('url' => $html->url(array('action' => 'wf_search', 'base' => false)), 'class' => 'search')),
    $form->input('query', array('label' => __('Find a link by typing', true), 'id' => 'SearchQuery')),
    $form->end();
?>