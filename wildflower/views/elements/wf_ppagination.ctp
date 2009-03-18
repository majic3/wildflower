<div class="paginator">
	<?php
		$paginationParameters = Array('../posts/');

	    $code = 
	    '<div class="paginate-counter">' . 
	    $paginator->counter(array(
    		'format' => '%start% to %end% of %count%' ,
			'url' => $paginationParameters
    	)) . 
    	'</div>' . 
    	$paginator->prev('« Newer ', array('class' => 'paginate-prev',
			'url' => $paginationParameters), null, array('class' => 'paginate-prev disabled')) . 
    	'<div class="paginate-numbers">' . 
    	$paginator->numbers() . 
    	'</div>' . 
        $paginator->next(' Older »', array('class' => 'paginate-next',
			'url' => $paginationParameters), null, array('class' => 'paginate-next disabled'));

			echo (str_replace(Array('/wf', '/index'), Array('', ''), $code));
			//	echo $code;
    ?>
	<span class="cleaner"></span>
</div>