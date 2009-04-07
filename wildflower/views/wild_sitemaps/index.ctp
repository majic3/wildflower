
	<ul>
		<li><h3 class="category">Pages</h3>
    <?php foreach ($pages as $page):?>
        <li><?php echo Router::url('/'.$page['WildPage']['url'],true); ?> <?php echo $time->toAtom($page['WildPage']['updated']); ?></li>
    <?php endforeach; ?>
    </ul></li>
		<li><h3 class="category"><?php	echo Configure::read('Wildflower.blogIndex');	?></h3>
    <?php foreach ($posts as $post):?>
        <li><?php echo Router::url('/'.Configure::read('Wildflower.postsParent') . '/' . $post['WildPost']['uuid'], true); ?> <?php echo $time->toAtom($post['WildPost']['updated']); ?></li>
    <?php endforeach; ?>
    </ul></li>
	</ul>
    <!-- static pages -->
    <ul>
    <!-- posts-->    