
<div class="posts mod">
	<div class="inner">
		<div class="hd">
		<h2> Latest Posts</h2>
		</div>
		<div class="bd">
		<?php

		//	$posts = $this->requestAction('/posts/latest/'.$categorySlug.'/'.$categoryLimit);

		$posts = $this->requestAction('/posts/latest');


		//pr($posts);
		if(!empty($posts)):
		foreach ($posts as $post) :
		?>
				<h3><?php echo $html->link($post['Post']['title'], Post::getUrl($post['Post']['slug'])); ?></h3>
				<?php echo $html->link(' >>', Post::getUrl($post['Post']['slug']), array('class' => 'post_link'));      ?>
				<small class="post-date">Posted <?php echo $time->niceShort($post['Post']['created']) ?></small>
		<?php
		endforeach;
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