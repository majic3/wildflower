<?php 

$dynamics = $navigation->reformData($dynamics, false);
$statics = $navigation->reformData($statics);

//  debug($statics);
//  debug($dynamics);

$this->pageTitle = 'Sitemap'; ?>

		<div class="sitemap">
			<ul id="utilityNav">
				<li><a href="/register">Register</a></li>
				<li><a href="/login">Log In</a></li>
				<li><a href="/sitemap">Site Map</a></li>
			</ul>

			<ul id="primaryNav" class="col2">
            <li id="home"><?php echo $html->link(Configure::read('AppSettings.site_name') . ' Sitemap', '/', null, null, false) ?></li>

            <li><?php
            if(isset($statics) && !empty($statics) ):?>
                        <!-- STATICS not home -->
                        <ul>
                        <?php foreach ($statics as $static):    ?>
                            <li>
                            <?php echo $html->link(
                                           $static['title'],
                                           $static['url']); ?>
                            </li>
                        <?php endforeach;?>
                        </ul>
                        <!-- /STATICS -->
            <?php endif; ?>
            
            </li><?php
        
            if( isset($dynamics) && !empty($dynamics) ):
                ?><li>
                        <!-- DYNAMIC General Units  -->
                    <ul><?php
                foreach ($dynamics as $dynamic): 
                    ?>
                        <li>
                            <h4>
                            <?php echo $html->link(
                                           $dynamic['options']['displaytitle'],
                                           $dynamic['options']['parentUrl']
                                           ); ?>
                            </h4>
                            <!--  <?php echo $dynamic['options']['displaytitle']; ?> Unit  -->
                            <ul>
                            <?php foreach ($dynamic['data'] as $section):?>
                                <li>
                                    <?php 
                                    $title = $section[$dynamic['model']][$dynamic['options']['fields']['title']];
                                    $url = $section['url'] ? $section['url'] :  
                                               array(
                                                      'controller' => $dynamic['options']['url']['controller'], 
                                                      'action' => $dynamic['options']['url']['action'], 
                                                      $section[$dynamic['model']][$dynamic['options']['fields']['id']]
                                                );
                                    echo $html->link($title,$url); ?>
                                </li>
                                <!--  /<?php echo $dynamic['options']['displaytitle']; ?> Unit  -->
                            <?php endforeach;?>
                            </ul>
                            <!-- /DYNAMIC General Units  -->
                        </li>
                    <?php
                    endforeach;
                    ?></ul>
                    <!--  /DYNAMIC GENERAL Units  -->
            </li><?php
        endif; ?> 
		</ul>
        </div><!-- /.sitemap --> 