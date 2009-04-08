<div id="primary-content">

	<h2>Search</h2>
	
	<?php 
		echo $form->create('Dashboard', array('url' => '/search', 'class' => 'search'));
	    echo "<fieldset>\n";
	    echo $form->input('query');
	    echo $form->submit('Search');
	    echo "</fieldset>\n";
	    echo $form->end();
	?>
	
	<?php if (isset($results) && !empty($results)) { ?>
	<h3>Search results for "<?php echo hsc($this->data['Dashboard']['query']) ?>"</h3>
	
	<ul>
	<?php
		$pparent = Configure::read('Wildflower.postsParent');
		foreach ($results as $item) {
			$row = '';
	        if (isset($item['WildPage'])) {
	            $row = $html->link($item['WildPage']['title'], $item['WildPage']['url']); 
	        } else if (isset($item['WildPost'])) {
				debug($item);
	            $row = $html->link($item['WildPost']['title'], "/$pparent/{$item['WildPost']['slug']}");
	        } else {
	            continue;
	        }
	        
	        echo "<li>$row</li>\n";
		}
	?>
	</ul>
	<?php } ?>
	
</div>

<?php echo $this->renderElement('sidebar') ?>