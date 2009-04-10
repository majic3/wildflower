<div id="searchBox">
<?php
	echo $form->create('Dashboard', array('url' => '/search', 'class' => 'search'));
	echo $form->input('query', array('label' => 'Search', 'id' => 's'));
	echo $form->submit('go.gif', array('id' => 'go'));
	echo $form->end();
?>
</div>
