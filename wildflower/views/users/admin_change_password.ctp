<?php
echo $navigation->create(array(
        'All users' => array('action' => 'index'),
        'Edit user' => array('action' => 'admin_edit', $this->data['User']['id']),
    ), array('id' => 'sub-nav', 'class' => 'always-current'));
?>

<h3>Change password for user <?php echo hsc($this->data['User']['name']) ?></h3>
<div id="genPassword"></div>
<?php echo 
    $form->create('User', array('url' => $html->url(array('action' => 'admin_update_password', 'base' => false)))),
    $form->input('password', array('between' => '<br />', 'label' => 'New password', 'tabindex' => '1')),
	'<div id="passwordStrength" class="is0"></div><div class="cleaner"></div>',
    $form->input('confirm_password', array('between' => '<br />', 'label' => 'New password again', 'type' => 'password', 'tabindex' => '2')),
    '<div class="hidden">',
    $form->hidden('name'),
    $form->hidden('id'),
    '</div>',
    $wild->submit('Save changes'),
    $form->end();
?>
