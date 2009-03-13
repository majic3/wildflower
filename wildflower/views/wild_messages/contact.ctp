<?php
/**
 * Wildflower loads this template for home page.
 * Place any other templates for pages in this directory.
 *
 * You can overwrite this by placing a home.ctp file inside app/views/wild_pages/home.ctp
 *
 * @package wildflower
 */
?>
<div id="main"> 
		<h2><?php echo $page['WildPage']['title']; ?></h2>
		<?php $session->flash(); ?>
		<?php echo $page['WildPage']['content']; ?>
		<?php echo $this->element('edit_this', array('id' => $page['WildPage']['id'])) ?>
</div>

<div id="aside">
	<?php
		echo 
		$form->create('Message', array('url' => '/contact/create', 'class' => 'hform')),
		"<fieldset>\n",
		"<legend>Contact form</legend>\n",
		$form->input('name'),
		$form->input('email'),
		$form->input('phone'),
		$form->input('subject'),
		$form->input('content', array('type' => 'textarea')),
		$form->submit('Send my message'),
		"</fieldset>\n",
		$form->end();
	?>
</div>