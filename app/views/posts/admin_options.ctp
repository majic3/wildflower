<?php 
    echo 
    $form->create('Post', array('url' => $html->url(array('action' => 'update', 'base' => false)), 'class' => 'horizontal-form')),
    '<div>',
    $form->hidden('id'),
    '</div>';
?>

<h2 class="section">Post Options</h2>
<?php
    echo 
    $form->input('draft', array('type' => 'select', 'label' => 'Status', 'options' => Post::getStatusOptions())),
    $form->input('description_meta_tag', array('type' => 'textarea', 'rows' => 4, 'cols' => 60, 'tabindex' => '4')),
    $form->input('keywords_meta_tag', array('type' => 'textarea', 'rows' => 4, 'cols' => 60, 'tabindex' => '4')),
    $form->input('slug', array('label' => 'URL slug', 'size' => 61)),
	$form->input('comments_allowed', array('label' => 'Allow Comments', 'size' => 1)),
    $form->input('created', array());
?>

<div id="edit-buttons">
    <div class="submit save-section">
        <input type="submit" value="<?php __('Save options'); ?>" />
    </div>
    <div class="cancel-edit"> <?php __('or'); ?> <?php echo $html->link(__('Cancel and go back to post edit', true), array('action' => 'edit', $this->data['Post']['id'])); ?></div>
</div>
<?php echo $form->end(); ?>

<span class="clearer"></span>

<div id="socialWeb">
	<h3>Scoial Web</h3>
	<div class="short">
		<h4>Short Url</h4>

		<?php if(isset($short['id']))
		echo '<p class="short-url">' . $html->link('short', Configure::read('Wildflower.shorturl') . "/{$short['slug']}") . "</p>";
		echo 
		$form->create('Short', array('url' => $html->url(array('controller' => 'shorts', 'action' => 'update', 'base' => false)), 'class' => 'horizontal-form')),
		'<div><p>', Configure::read('Wildflower.shorturl') ."/",
		$this->data['Post']['slug'],'</p>',
		$form->hidden('url', Array('value' => '/' . Configure::read('Wildflower.postsParent') . '/' . $this->data['Post']['slug'])),
		$form->hidden('slug', Array('value' => str_replace('/' . Configure::read('Wildflower.shorturl') . '/', '', $short['slug']))),
		$form->hidden('id', Array('value' => $short['id'])),
		$form->hidden('modelID', Array('value' => $this->data['Post']['id'])),
		$form->hidden('modelName', Array('value' => 'Post')),
		'</div>';
	?>

		<div class="horizontal-form-buttons">
			<?php	if(isset($short['id'])):	?>
			<div class="cancel-short"> <?php echo $html->link(__('clear short', true), '/'.Configure::read('Routing.admin').'/shorts/delete/' . $short['id'], Array('class' => 'clearshort')); ?></div>
			<?php	else:	?>
			<div class="submit save-section">
				<input type="submit" value="<?php __('Set Short'); ?>" />
			</div>
			<?php	endif;	?>
		</div>
	<?php 
		echo 
		$form->end();
	?>
	</div>
	<div class="chatcatcher">
		<h4>Chatcatcher</h4>
		<div><p>pingback</p></div>
		<div><p>pingback</p></div>
		<div><p>pingback</p></div>
		<div><p>pingback</p></div>
	</div>
</div>

<?php $partialLayout->blockStart('sidebar'); ?>
    <li class="sidebar-box">
        <h4>Editing options for post...</h4>
        <?php echo $html->link($this->data['Post']['title'], array('action' => 'edit', $this->data['Post']['id']), array('class' => 'edited-item-link')); ?>
    </li>
<?php $partialLayout->blockEnd(); ?>