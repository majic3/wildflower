<div id="paginatorBtm" class="wrapper">
	<?php
		$options = array(
			'tag' => 'li'
		);

	    echo
	    '<div class="paginate-counter"><p class="quiet"><small>', 
	    $paginator->counter(am(array(
    		'format' => '%start% to %end% of %count%'
    	), $options)),
    	'</small></p></div>', '<ul class="paging">',
    	$paginator->prev('« newer ', am(array('tag' => 'li','class' => 'previous'), $options), null, am(array('tag' => 'li', 'class' => 'paginate-prev disabled') , $options)),
    	$paginator->numbers(am(array('separator' => ''), $options)),'<li>',
        $paginator->next('older »', am(array('tag' => 'li','class' => 'next'), $options), null, am(array('tag' => 'li','class' => 'paginate-next disabled') , $options)), '</li></ul>';
    ?>
</div>