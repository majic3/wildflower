<div class="paginator">
	<?php
		$options = array(
			'tag' => 'li'
		);

	    echo
	    '<div class="paginate-counter"><p class="small"><small>', 
	    $paginator->counter(am(array(
    		'format' => '%start% to %end% of %count%'
    	), $options)),
    	'</small></p></div>', '<div class="paging"><ul>',
    	$paginator->prev('« newer ', am(array('tag' => 'li','class' => 'previous'), $options), null, am(array('tag' => 'li', 'class' => 'previous disabled') , $options)),
    	$paginator->numbers(am(array('separator' => ''), $options)),'<li>',
        $paginator->next('older »', am(array('tag' => 'li','class' => 'next'), $options), null, am(array('tag' => 'li','class' => 'next disabled') , $options)), '</li></ul></div>';
    ?>
</div>