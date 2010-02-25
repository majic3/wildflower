<div class="actions-handle">
    <span class="row-check"><?php
	
	$displayField = 'title';
	$model = 'Sidebar';
	$action = 'edit';
	$controller = 'sidebars';

	$checked = array();

	foreach($this->data['Sidebar'] as $sbar)	{
		if($data[$model]['id'] == $sbar['id']) {
			$checked['checked'] = 'checked';
		}
	}

	echo $form->checkbox($model.'.' . $data[$model]['id'], array_merge($checked, array('value' => $data[$model]['id']))) ?></span>
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