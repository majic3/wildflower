<h2 class="section">Welcome to <?php echo $siteName ?> administration</h2>

<p>Dashboard shows a summary of the latest happening on your site.</p>

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
					echo "<li><div class=\"list-item\">",
						$html->link($page['WildPage']['title'], array('controller' => 'wild_pages', 'action' => 'edit', $page['WildPage']['id'])), 
						'</div></li>';    
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
					echo "<li><div class=\"list-item\">",
						$html->link($page['WildPage']['title'], array('controller' => 'wild_pages', 'action' => 'edit', $page['WildPage']['id'])), 
						'</div></li>';    
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
					echo "<li><div class=\"list-item\">",
						$html->link($post['WildPost']['title'], array('controller' => 'wild_posts', 'action' => 'edit', $post['WildPost']['id'])), 
						'</div></li>';    
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
					echo "<li><div class=\"list-item\">",
						$html->link($post['WildPost']['title'], array('controller' => 'wild_posts', 'action' => 'edit', $post['WildPost']['id'])), 
						'</div></li>';    
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
				echo '<ul class="comments-list list">';
				foreach($comments as $cmt)	{
					echo "<li><div class=\"list-item\">",
						$html->link($cmt['WildPost']['title'] . '/' . $cmt['WildComment']['email'] . ' - ' . $time->format('j M y', $link['WildComment']['created']), array('controller' => 'wild_comments', 'action' => 'view', $cmt['WildComment']['id'])), 
						'</div></li>';
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
					echo "<li><div class=\"list-item\">",
						$html->link($msg['WildMessage']['subject'] . ' - ' . $time->format('j M y', $msg['WildMessage']['created']), array('controller' => 'wild_messages', 'action' => 'view', $msg['WildMessage']['id'])), 
						'</div></li>';
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
