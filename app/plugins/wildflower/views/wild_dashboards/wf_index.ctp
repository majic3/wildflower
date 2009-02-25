<h2 class="section">Welcome to <?php echo $siteName ?> administration</h2>

<p>Dashboard shows a summary of the latest happening on your site.</p>
<div class="wrapper">
	<div id="dashPages">
<h3>Pages modified recently</h3>
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
<?php	echo ($html->link('write new', '/wf/pages/create/'));	?>
</div>
	<div id="dashPosts">
<h3>Posts</h3>
<ul class="tabs">
	<li><a href="#recent">recent</a></li>
	<li><a href="#quickpost">quick post</a></li>
</ul>
	<div id="recent"><p>recent</p></div>
	<div id="quickpost"><p>quick post</p></div>
</div>
	<div id="dashCmnts">
<h3>Comments</h3>
<ul class="tabs">
	<li><a href="#new">new</a></li>
	<li><a href="#spam">spam?</a></li>
</ul>
	<div id="new"><p>new</p></div>
	<div id="spam"><p>spam?</p></div>
</div></div>
	<div id="dashMsg"><p>messages in the inbox</p></div>
</div>
<div id="dashFeeds" class="wrapper"> 
    <a class="feed" href="http://jquery.com/blog/feed/">jQuery Blog</a> 
    <a class="feed" href="http://www.learningjquery.com/feed/">Learning jQuery</a>
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
