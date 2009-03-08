<li class="insert_link_sidebar">
    <h4>Insert Link to Content or Resource</h4>

    <ul class="widget_links">
		<?php	foreach($results as $link)	{
        $row = '';
        if (isset($link['WildPage'])) {
            $row = $html->link($link['WildPage']['title'], 
                array('controller' => 'pages', 'action' => 'edit', $link['WildPage']['id']));   
        } else if (isset($link['WildPost'])) {
            $row = $html->link($link['WildPost']['title'], 
                array('controller' => 'posts', 'action' => 'edit', $link['WildPost']['id']));
        } else {
            continue;
        }
        
        echo "<li>$row</li>\n";
		}

		//print_r($results);
		?>
    </ul>

    <a class="cancel" href="Close">Close insert link sidebar</a>
</li>
