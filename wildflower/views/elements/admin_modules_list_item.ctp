<?php
$modules = array_keys($data);

if($modules[0] == 'Sidebar' || $modules[0] == 'Menu'):
$name = $modules[0];
?>
<div class="actions-handle">
	<?php
		switch($name):
			case 'Menu':
				$model = 'Menu';
			default:
				if(!isset($displayField))
					$displayField = 'title';

				if(!isset($model))
					$model = 'Sidebar';

				if(!isset($action))
					$action = 'edit';
				
				if(!isset($controller))
					$controller = strtolower(inflector::pluralize($model));
			break;
		endswitch;
	?>
    <span class="row-check"><?php echo $form->checkbox('id.' . $data[$model]['id']) ?></span>
    <?php
        $tree->addItemAttribute('id', strtolower($model) . '-' . $data[$model]['id']);
        $tree->addItemAttribute('class', 'level-' . $depth);
        
        // settings or order or props of somekind
        //if ($data['$model']['draft']) {
            //echo '<small class="draft-status">(', __('Draft', true), ')</small> ';
        //}
    
        echo $html->link(
			$data[$model][$displayField],
				array(
					'controller' => $controller, 
					'action' => $action, 
					$data[$model]['id']
				), 
				array(
					'title' => ucfirst($action) . ' this ' . $model . '.'
			)
		); 
    ?>
    <span class="row-actions"><?php echo $html->link('Edit', 
	array(
		'action' => $action,
		$data[$model]['id']
	), 
	array('class' => '', 'title' => 'View this page.')); ?></span>
    <span class="cleaner"></span>
</div>
<?php
endif;		
?>