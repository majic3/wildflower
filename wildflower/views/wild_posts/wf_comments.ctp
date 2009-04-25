<?php 
    echo 
    $form->create('WildComment', array('action' => 'mass_update'));
?>

<div class="section">
    <h2>Comments on <?php echo $html->link($this->data['WildPost']['title'], array('action' => 'edit', $this->data['WildPost']['id'])); ?></h2>
</div>

<div id="comments">
    <ul>
        <li><?php echo $htmla->link(__('Published', true), array('action' => 'comments', $this->data['WildPost']['id']), array('currentOn' => array('action' => 'comments', $this->data['WildPost']['id']))); ?></li>
        <li><?php echo $htmla->link(__('Awaiting approval', true), array('action' => 'comments', $this->data['WildPost']['id'], 'unapproved')); ?></li>
        <li><?php echo $htmla->link(__('Spam', true), array('action' => 'comments', $this->data['WildPost']['id'], 'spam')); ?></li>
    </ul>
</div>

<p><?php echo $html->link(__('Back to post edit', true), array('action' => 'edit', $this->params['pass'][0])); ?></p>

<?php echo $form->end(); ?>


<?php $partialLayout->blockStart('sidebar'); ?>
	<li class="sidebarblock"><?php	echo $html->link(__('reply', true), array('controler' => 'comments', 'action' => 'reply', $this->params['pass'][0]));	?></li>
<?php $partialLayout->blockEnd(); ?>