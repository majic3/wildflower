
<div class="rightCol">
<?php $session->flash(); ?>

<?php
    $url = $html->url(array('controller' => 'messages', 'action' => 'index', 'base' => false));
    echo 
    $form->create('Message', array('url' => $url, 'class' => 'contact_form')),
    "<fieldset>\n",
    "<legend>", __('Contact form', true), "</legend>\n",
    $form->input('name'),
    $form->input('email'),
    $form->input('content', array('type' => 'textarea', 'label' => 'Message')),
    "</fieldset>\n",
    $form->submit('Send my message'),
    $form->end();
?>
</div>

<div class="main">
<div class="entry">
<h2><?php echo $page['Page']['title']; ?></h2>
<?php echo $page['Page']['content']; ?>
<?php echo $this->element('edit_this', array('controller' => 'pages', 'id' => $page['Page']['id'])) ?>
</div>

</div>

