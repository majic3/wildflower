<?php
echo $navigation->create(array(
        'All Examples' => array('action' => 'index')
    ), array('id' => 'sub-nav', 'class' => 'always-current'));


	//debug($this->data['Example']['title']);
?>


<h3>Editing Example <?php  echo $this->data['Example']['title'] .'/'. $this->data['Example']['pos']; ?></h3>
<?php 	

    echo 
    $form->create('Example', array('enctype'=>"multipart/form-data", 'url' => $html->url(array('action' => 'wf_update', 'base' => false)))),
    $form->input('pos', array('between' => '<br />', 'tabindex' => '1')),
    $form->input('title', array('between' => '<br />', 'tabindex' => '2')),
	$form->input('photo',array('type' => 'file','label'=>__('Photo for the example should be sq 450 or greater and is resized',true))), 
    $form->input('content', array('type' => 'textarea', 'class' => 'tinymce', 'between' => '<br />', 'tabindex' => '3')),
    '<div class="hidden">',
    $form->hidden('id'),
    '</div>',
    $wild->submit('Save changes'),
    $form->end();
?>