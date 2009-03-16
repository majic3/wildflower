<?php

	
echo $form->create('WildUser', array('url' => $here));
echo $form->input('useroremail', array('between' => '<br />', 'label' => 'User or Email'));
echo $wild->submit('reset password');
echo $form->end();

?>