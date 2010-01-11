<h2 class="section"><?php __('Editing sidebar'); ?></h2>
<?php 
    echo $form->create('Sidebar', array('url' => $here, 'class' => 'editor_form')); ?>
<div class="panels">
	<ul id="displayOptions" class="tabs">
		<li><a href="#scontent">content</a></li>
		<li><a href="#pages">on pages</a></li>
	</ul>
	<div id="scontent" class="panel">
<?php
    echo
	$form->hidden('id'),
    $form->input('title'),
    $form->input('content', array('class' => 'tinymce'));
    ?>
	</div>
	<div id="pages" class="panel">
	<h4>
<?php
    
    __('Check to Enable this Region on associated Page'); ?></h4><?php
    
    echo $tree->generate($pages, array('model' => 'Page', 'class' => 'category-list checkbox-list', 'element' => '../sidebars/_tree_item')),

    $form->input('region', array('disabled' => true)),

    $form->input('on_posts', array('type' => 'checkbox', 'label' => 'Blog & posts'));

    // Custom associations
    $models = Configure::read('App.customSidebarAssociations');
    if (!empty($models)) {
        foreach ($models as $model) {
            echo $this->element('../sidebars/_' . Inflector::pluralize(low($model)) .  '_tree');
        }
    }
    ?>
	</div>

<span class="cleaner"></span>
</div>
<?php
    echo $form->end('Save changes');
?>

<div class="cancel-edit"> <?php __('or'); ?> <?php echo $html->link(__('Cancel', true), array('action' => 'index')); ?></div>

<?php $partialLayout->blockStart('sidebar'); ?>
    <?php echo $this->element('../sidebars/_sidebar_edit_right_menu'); ?>
    <li><?php echo $html->link(
        '<span>' . __('Add a new sidebar', true) . '</span>',
        array('action' => 'add'),
        array('class' => 'add', 'escape' => false)); ?>
    </li>
<?php $partialLayout->blockEnd(); ?>

