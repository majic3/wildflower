<div class="paginator">
	<?php
		$options = array(
			'tag' => 'li'
		);

		echo
		'<div class="paginate-counter"><p class="quiet">', 
		$paginator->counter(
			am(array('format' => '%start% to %end% of %count%'), $options)
		),
		'</p></div>', '<ul class="paging">',
		$paginator->prev(
			'« newer ', 
			am($options, array('tag' => 'li','class' => 'previous')), 
			null, 
			am($options, array('tag' => 'li', 'class' => 'previous disabled'))
		),
		$paginator->numbers(
			am($options, array('tag' => 'li', 'separator' => ' '))
		),
		$paginator->next(
			'older »', 
			am($options, array('tag' => 'li','class' => 'next')), 
			null, 
			am($options, array('tag' => 'li','class' => 'next disabled'))
		), '</ul>';
	?>
</div>