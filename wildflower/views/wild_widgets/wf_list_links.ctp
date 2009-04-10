<li class="insert_link_sidebar">
	<h4>Insert Link to Content or Resource</h4>
	<a class="rss" href="rss">choose from rss</a>

	<ul class="widget_links">
		<?php	foreach($results as $link)	{
		$row = '';
		if (isset($link['WildPage'])) {
			$row = "<span>page</span>";
			$row.= $html->link($link['WildPage']['title'], '/' . $link['WildPage']['slug'], Array(
					'title' => $link['WildPage']['description_meta_tag'],
					'class' => 'page'
					)
			);
		} else if (isset($link['WildPost'])) {
			$row = "<span>post</span>";
			$row.= $html->link(
				$link['WildPost']['title'], 
				'/' . Configure::read('Wildlfower.blogIndex') . '/' . $link['WildPost']['uuid'], Array(
					'title' => $link['WildPost']['description_meta_tag'],
					'class' => 'post'
					)
			);
		} else if (isset($link['WildLink'])) {
			$row = "<span>link</span>";
			$row.= $html->link($link['WildLink']['name'], 
				((strrpos($link['WildLink']['url'], Array('mailto:', 'git://', 'http://', 'https://', 'ftp://')) === false) ? 'http://' : '') . $link['WildLink']['url'], Array('title' => $link['WildLink']['name'], 'class' => 'exlink'));
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
