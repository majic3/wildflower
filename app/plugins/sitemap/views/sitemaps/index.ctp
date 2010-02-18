<?php 

$dynamics = $navigation->reformData($dynamics, false);
$statics = $navigation->reformData($statics);

//  debug($statics);
//  debug($dynamics);

$this->pageTitle = 'Sitemap'; ?>

		<div class="sitemap">
			<ul id="utilityNav">
				<?php
					$explodedUtils = Configure::read('Wildflower.settings');
					$explodedUtils = explode(',', $explodedUtils['Sitemap.utils']);
					foreach($explodedUtils as $util)	{
						echo '<li>', $html->link(basename($util), $util), '</li>';
					}
				?>
			</ul>

		<?php
			echo $wfSitemap['Sitemap']['content'];
		?>
	</div><!-- /.sitemap --> 