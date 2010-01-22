
<div class="posts mod">
	<div class="inner">
		<div class="hd">
		<h2> Latest Posts</h2>
		</div>
		<div class="bd">
		<?php

		//	$posts = $this->requestAction('/posts/latest/'.$categorySlug.'/'.$categoryLimit);

		$posts = $wild->menu('latestPosts', array());


		//pr($posts);
		if(!empty($posts)):
		echo $posts;
		else:
		?>
		<p>No posts have been found</p>
		<?php
		endif;
		?>
		</div>
		<div class="ft"></div>
	</div>
</div>