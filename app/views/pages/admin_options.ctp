<?php
    echo 
    $form->create('Page', array('url' => $html->url(array('action' => 'update', 'base' => false)), 'class' => 'horizontal-form')),
    '<div>',
    $form->hidden('id'),
    $form->hidden('draft'),
    '</div>';
?>

<h2 class="section">Page options for <?php echo $html->link($this->data['Page']['title'], array('action' => 'edit', $this->data['Page']['id'])); ?></h2>
<?php
    echo 
    $form->input('parent_id', array('type' => 'select', 'label' => 'Parent page', 'options' => $parentPageOptions, 'empty' => '(none)', 'escape' => false)),
    $form->input('draft', array('type' => 'select', 'label' => 'Status', 'options' => Page::getStatusOptions())),
    $form->input('description_meta_tag', array('type' => 'textarea', 'rows' => 4, 'cols' => 60, 'tabindex' => '4')),
    $form->input('keywords_meta_tag', array('type' => 'textarea', 'rows' => 4, 'cols' => 60, 'tabindex' => '4')),
    $form->input('slug', array('label' => 'URL slug', 'size' => 61)),
    $form->input('created', array());
?>

<div class="horizontal-form-buttons">
    <div class="submit save-section">
        <input type="submit" value="<?php __('Save options'); ?>" />
    </div>
    <div class="cancel-edit"> <?php __('or'); ?> <?php echo $html->link(__('Cancel', true), array('action' => 'edit', $this->data['Page']['id'])); ?></div>
</div>

<?php 
    echo 
    $form->end(); ?>
<div id="socialWeb">
	<h3>Scoial Web</h3>
	<div class="short">
		<h4>Short Url</h4>
<?php
    echo 
    $form->create('Short', array('url' => $html->url(array('controller' => 'shorts', 'action' => 'update', 'base' => false)), 'class' => 'horizontal-form')),
    '<div><p>',
	$this->data['Page']['url'],'</p>',
    $form->hidden('url', Array('value' => $this->data['Page']['url'])),
    $form->hidden('slug', Array('value' => str_replace(array('/' . Configure::read('Wildflower.shorturl'), '/'), '', $short['slug']))),
    $form->hidden('id', Array('value' => $short['id'])),
    $form->hidden('modelID', Array('value' => $this->data['Page']['id'])),
    $form->hidden('modelName', Array('value' => 'Page')),
    '</div>';
	
	if(isset($short['id']))
	echo '<p class="short-url">' . $html->link('short', Configure::read('Wildflower.shorturl') . "/{$short['slug']}") . "</p>";
?>

	<div class="horizontal-form-buttons">
		<?php	if(isset($short['id'])):	?>
		<div class="cancel-short"><?php echo $html->link(__('clear short', true), '/'.Configure::read('Routing.admin').'/shorts/delete/' . $short['id'], Array('class' => 'clearshort')); ?></div>
		<?php	else:	?>
		<div class="submit save-section">
			<input type="submit" value="<?php __('Save options'); ?>" />
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
    <?php echo $this->element('../pages/_page_edit_right_menu'); ?>
<?php $partialLayout->blockEnd(); ?>