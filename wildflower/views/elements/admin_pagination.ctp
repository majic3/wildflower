<div class="paginator">
	<?php

		

		if(isset($wfPaging) && 
		   is_array($wfPaging))	{
			extract($wfPaging);
		}

		$options = array(
			'tag' => 'li'
		);

		if(isset($url))	{
			$options['url'] = $url;
		}

		$nOpt = $pOpts = $numOpts = $cOpts = $options;

		unset($options['page']);

		echo
		'<div class="paginate-counter"><p class="quiet">', 
		$paginator->counter(
			am(array('format' => '%start% to %end% of %count%'), $options)
		),
		'</p></div>', '<ul class="paging">',
		$paginator->prev(
			'« newer ', 
			am(array('class' => 'previous'), $options), 
			null, 
			am(array('class' => 'previous disabled'), $options)
		),
		$paginator->numbers(
			am(array('separator' => ' '), $options)
		),
		$paginator->next(
			'older »', 
			am(array('class' => 'next'), $options), 
			null, 
			am(array('class' => 'next disabled'), $options)
		), '</ul>';
	?>
</div>