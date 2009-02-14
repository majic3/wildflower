<div id="main">
	<?php
		switch($stage):
			case 2:
				echo($this->element('wild_users' . DS . 'genpass'));
			break;
			case 1:
			default:
				echo($this->element('wild_users' . DS . 'resetpass'));
			break;
		endswitch;
		echo($this->element('notices' . DS . 'message', compact($type, $message)));
	?>
</div>