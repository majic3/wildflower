<?php
/* todo: fix up quick post, fix messages error */


    $labels = array(
        'WildPage' => array(
            'name' => __('Page', true),
            'link' => '/pages/edit/:id',
            'class' => 'page'
        ), 
        'WildPost' => array(
            'name' => __('Post', true),
            'link' => '/posts/edit/:id',
            'class' => 'post'
        ),
        'WildComment' => array(
            'name' => __('Comment', true),
            'link' => '/comments/edit/:id',
            'class' => 'comment'
        ),
        'WildMessage' => array(
            'name' => __('Message', true),
            'link' => '/messages/view/:id',
            'class' => 'message'
        ),
        'WildAsset' => array(
            'name' => __('File', true),
            'link' => '/assets/edit/:id',
            'class' => 'file'
        ),
    );

	$pages = $items['WildPage'];
	$posts = $items['WildPost'];
	$comments = $items['WildComment'];
	$messages = $items['WildMessage'];
	$assets = $items['WildAsset'];

?><h2 class="section">Welcome to <?php echo $siteName ?> administration</h2>

<p><?php __('Recently added or changed content:'); ?></p>

<!-- <<<<<< HEAD:wildflower/views/wild_dashboards/wf_index.ctp -->
<div class="wrapper">
	<div id="dashPages" class="tabs">
		<h3>Pages modified recently</h3> 
		
		<ul>
			<li><a href="#pagesRecent">recent</a></li>
			<li><a href="#pagesDrafts">drafts</a></li>
		</ul>

		<div id="pagesRecent">
		<?php
			if (empty($pages)) {
				echo '<p>No pages yet.</p>';
			} else {
				echo '<ul class="pages-list list">';
				foreach ($pages as $page) {
					$label = empty($page['item']['title']) ? '<em>untitled</em>' : hsc($page['item']['title']);
					$url = '/' . Configure::read('Wildflower.prefix') . '/' . r(':id', $page['item']['id'], $labels[$page['class']]['link']);
					$link = $html->link($label, $url, array('escape' => false)); 
					echo "<li><div class=\"list-item\">", $link, '</div></li>';
				}
				echo '</ul>';
			}
		?>
		</div>
		<div id="pagesDrafts"><?php	
			if (empty($pageDrafts)) {
				echo '<p>No draft pages.</p>';
			} else {
				echo '<ul class="pages-list list">';
				foreach ($pageDrafts as $page) {
				}
				echo '</ul>';
			}
		?></div>
		<?php	echo ($html->link('write new', '/wf/pages/create/'));	?>
	</div>

	<div id="dashPosts" class="tabs">
		<h3><?php	echo ucfirst(Configure::read('Wildflower.blogName')); ?></h3>

		<ul>
			<li><a href="#postRecent">recent</a></li>
			<li><a href="#postDrafts">drafts</a></li>
			<li><a href="#postQuick">quick post</a></li>
		</ul>

		<div id="postRecent"><?php	
			if (empty($posts)) {
				echo '<p>No Posts yet.</p>';
			} else {
				echo '<ul class="posts-list list">';
				foreach ($posts as $post) {
					$label = empty($post['item']['title']) ? '<em>untitled</em>' : hsc($post['item']['title']);
					$url = '/' . Configure::read('Wildflower.prefix') . '/' . r(':id', $post['item']['id'], $labels[$post['class']]['link']);
					$link = $html->link($label, $url, array('escape' => false)); 
					echo "<li><div class=\"list-item\">", $link, '</div></li>';
				}
				echo '</ul>';
			}
		?></div>
		<div id="postDrafts"><?php	
			if (empty($postDrafts)) {
				echo '<p>No Post Drafts.</p>';
			} else {
				echo '<ul class="posts-list list">';
				foreach ($postDrafts as $post) {
				}
				echo '</ul>';
			}
		?></div>
		<div id="postQuick"><?php	echo $this->element('wild_posts/quickform');	?></div>
	</div>

	<div id="dashCmnts" class="tabs">
		<h3>Comments</h3>

		<ul>
			<li><a href="#new">new</a></li>
			<li><a href="#spam">spam?</a></li>
		</ul>

		<div id="new"><?php
			if (empty($comments)) {
				echo '<p>No Comments Since Last Login.</p>';
			} else {
				debug($comments);
				echo '<ul class="comments-list list">';
				foreach($comments as $cmt)	{
					$label = empty($cmt['item']['title']) ? '<em>untitled</em>' : hsc($cmt['item']['title']);
					$url = '/' . Configure::read('Wildflower.prefix') . '/' . r(':id', $cmt['item']['id'], $labels[$cmt['class']]['link']);
					$link = $html->link($label, $url, array('escape' => false)); 
					echo "<li><div class=\"list-item\">", $link, '</div></li>';
				}
				echo '</ul>';
			}	?></div>
		<div id="spam"><p>spam?</p></div>
	</div>
</div>

<div id="dashMsg">
	<h3>messages in the inbox</h3>
	<?php	
			if (empty($messages)) {
				echo '<p>No Messages Since Last Login.</p>';
			} else {
				echo '<ul class="msgs-list list">';
				foreach($messages as $msg)	{
					$label = empty($msg['item']['title']) ? '<em>untitled</em>' : hsc($msg['item']['title']);
					$url = '/' . Configure::read('Wildflower.prefix') . '/' . r(':id', $msg['item']['id'], $labels[$msg['class']]['link']);
					$link = $html->link($label, $url, array('escape' => false)); 
					echo "<li><div class=\"list-item\">", $link, '</div></li>';
				}
				echo '</ul>';
			}	?>
</div>

<div id="dashFeeds" class="wrapper"> 
	<?php	foreach(Configure::read('Icing.dashboardFeeds') as $feed): echo ($html->link($feed['name'], 'http://' . $feed['url'], Array('class' => 'feed'))); endforeach;	?>
</div>

<div id="dashStats" class="wrapper">
	<div id="hitsThisWeek"></div>
	<div id="searchAndRefers"></div>
	<div id="pieBrowsers"></div>
	<div id="pieDiskSpace"></div>
	<?php	echo ($html->link('more data', '/wf/stats/'));	?>
</div>

<?php $partialLayout->blockStart('sidebar'); ?>
    <li>
        <?php
            echo
            $form->create('WildDashboard', array('url' => $html->url(array('action' => 'wf_search', 'base' => false)), 'class' => 'search')),
            $form->input('query', array('label' => __('Find a page or post by typing', true), 'id' => 'SearchQuery')),
            $form->end();
        ?>
    </li>
<?php $partialLayout->blockEnd(); ?>
