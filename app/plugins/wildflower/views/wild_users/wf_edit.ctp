<?php
echo $navigation->create(array(
        'All users' => array('action' => 'index'),
        'Change password' => array('action' => 'wf_change_password', $this->data['WildUser']['id']),
    ), array('id' => 'sub-nav', 'class' => 'always-current'));
?>
<div id="editUsr">
<h3>Editing user <?php echo $this->data['WildUser']['name']; ?></h3>
<?php 
	print_r($this->data['WildProfile']);
    echo 
    $form->create('WildUser', array('url' => $html->url(array('action' => 'wf_update', 'base' => false)))),
    $form->input('name', array('between' => '<br />', 'tabindex' => '1')),
    $form->input('email', array('between' => '<br />', 'tabindex' => '2')),
    $form->input('login', array('between' => '<br />', 'tabindex' => '3')),
    '<div class="hidden">',
    $form->hidden('id'),
    '</div>',
    $wild->submit('Save changes'),
    $form->end();
?>
</div>

<div id="profile">
<?php if(!$this->data['WildProfile']['id']): ?>
<div>
<h3>Your profile <?php echo $this->data['WildUser']['name']; ?></h3>
<?php echo $form->create('WildProfile', array('enctype'=>"multipart/form-data", 'url' => '/wf/profiles/create'));?>
	<fieldset>
 		<legend><?php __('Add Profile');?></legend>
	<?php
		echo $form->file('WildProfile.avatar',array('label'=>__('Article Avatar',true))); 
		echo $form->input('data', array(
        'type' => 'textarea',
        'tabindex' => '2',
        'class' => 'tinymce',
        'rows' => '25',
        'label' => 'Content',
        'between' => '<br />',
        'div' => array('class' => 'input editor')));
		echo $form->input('url');
	?>
	</fieldset>
<?php echo $form->end('Submit');?>
</div>
<?php else: ?>
<h3>Your profile <?php echo $this->data['WildProfile']['name']; ?></h3>
<div class="tabs">
	<ul>
		<li><a href="#viewProfile">view</a></li>
		<li><a href="#editProfile">edit</a></li>
	</ul>
	<div class="viewProfile">
		<div class="profileData">
		<dl>
			<dt>Posts (number)</dt>
			<dd>
				<ol>
					<li>one</li>
					<li>two</li>
					<li>three</li>
					<li>four</li>
					<li>five</li>
				</ol>
			</dd>
			<dt>Pages (number)</dt>
			<dd>
				<ol>
					<li>one</li>
					<li>two</li>
					<li>three</li>
					<li>four</li>
					<li>five</li>
				</ol>
			</dd>
		</dl>
		</div>
		<div class="profileData">
		<dl>
			<dt>Posts (number)</dt>
			<dd>
				<ol>
					<li>one</li>
					<li>two</li>
					<li>three</li>
					<li>four</li>
					<li>five</li>
				</ol>
			</dd>
			<dt>Pages (number)</dt>
			<dd>
				<ol>
					<li>one</li>
					<li>two</li>
					<li>three</li>
					<li>four</li>
					<li>five</li>
				</ol>
			</dd>
		</dl>
		</div>
	</div>
	<div class="editProfile">
	<?php echo $form->create('WildProfile', array('enctype'=>"multipart/form-data", 'url' => '/wf/profiles/update'));?>
		<fieldset>
			<legend><?php __('Edit Profile');?></legend>
		<?php
			echo $form->input('id');
			echo $form->hidden('user_id');
			//if($this->data['WildProfile']['avatar'])
			//echo $html->image(substr($this->data['WildProfile']['avatar']['s'], 1, strlen($this->data['WildProfile']['avatar']['s'])));
			echo $form->file('WildProfile.avatar',array('label'=>__('Article Avatar',true))); 
			echo $form->input('data', array(
        'type' => 'textarea',
        'tabindex' => '2',
        'class' => 'tinymce',
        'rows' => '25',
        'label' => 'Content',
        'between' => '<br />',
        'div' => array('class' => 'input editor')));
			echo $form->input('url');
		?>
		</fieldset>
	<?php echo $form->end('Submit');?>
	</div>
<?php endif; ?>
</div>