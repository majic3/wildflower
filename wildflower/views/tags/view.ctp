<div class="rightCol">
	<div class="line">
		<div class="lastUnit size1of1">
			<?php echo $this->element('tag_cloud', array('default' => true));  ?>
		</div>
	</div>
</div>

<div class="main">
	<?php
		foreach($data as $Tag):
			$models = array_keys($Tag);
			debug($models);
			$model = $models[0];
			if($model == 'Page' || $model == 'Post'):
				$tagBody = '';
				$tagBody.= '<h3>' . $html->link($Tag[$model]['title'], $Tag[$model]['slug']) . '</h3>';
				$tagBody.= '<div class="unit size1of1">' . $Tag[$model]['content'] . '</div>';
				echo '<div class="', $model,' line">', $tagBody, '</div>';
			endif;
		endforeach;
	?>
</div>