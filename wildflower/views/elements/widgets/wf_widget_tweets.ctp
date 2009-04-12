<div id="twitter" class="mod<?php echo (isset($data['WildWidget']['style'])) ? ' ' . $data['WildWidget']['style'] : ''); ?>"> 
	<div class="inner">
		<?php if(isset($data['WildWidget']['head']))): ?>
		<div class="hd">
			<?php echo $data['WildWidget']['head']; ?>
		</div>
		<?php endif; ?>
		<div class="bd">
			<ul>  
				<?php
					if ($data['WildWidget']['tweets']) {	
						foreach($data['WildWidget']['tweets'] as $tweet)	{
							echo '<blockquote><p>' . $tweet['text'] . '</p><p><cite>' . $html->link($tweet['tweetee'], $tweeter['twitterurl']) . '</cite>' . $ . '</p>', '</blockquote>';
						}
					}
				?>
				<li>
					<p>test tweet</p>
					<h4>@Murry</h4>
				</li>
				<li>
					<p>test tweet</p>
					<h4>@Murry</h4>
				</li>
				<li>
					<p>test tweet</p>
					<h4>@Murry</h4>
				</li>
				<li>
					<p>test tweet</p>
					<h4>@Murry</h4>
				</li>
				<li>
					<p>test tweet</p>
					<h4>@Murry</h4>
				</li>
			</ul>
		</div>
		<?php if(isset($data['WildWidget']['foot']))): ?>
        <div class="ft">
            <?php	echo $html->link($data['WildWidget']['twitterUrl'], '');	?>
		</div>
		<?php endif; ?>
	</div> 
	<?php	if(isset($data['WildWidget']['fancy'])):	?>
		<b class="top"><b class="tl"></b><b class="tr"></b></b><b class="bottom"><b class="bl"></b><b class="br"></b></b>
	<?php	endif;	?>
</div>