<?php
/**
 * Majic3/About.
 *
 * @package majic3
 */

/*
	plan to allow users the ability to set sidebar location via page params
	possible plan to allow sidebars to be set sidebar or aside (these might not be sidebars per see)
	not really going to set it hard and fast how its coded but sidebars would need params too

	the template helper merged into wild helper needs to be altered to use widgets and be able to 
	pick a widget or place one with data set via controller ie being able to pass it array data not 
	possible with adhoc code from bakery
*/
if(!empty($page['Sidebar'])): 
?>
<div class="leftCol">
        <div class="mod complex"> 
                <b class="top"><b class="tl"></b><b class="tr"></b></b>
            <div class="inner">
                <div class="bd">
                    <?php	echo $wild->processSidebar($page['Sidebar']); ?>
                </div>
            </div>
            <b class="bottom"><b class="bl"></b><b class="br"></b></b> 
        </div>

    <div class="line">
        <div class="unit size1of2">
        </div>
        <div class="lastUnit  size1of2">
        </div>
    </div>
</div><?php
endif;
if(isset($sidebar['aside']) && !empty($sidebar['aside'])): 
?>
<div class="rightCol">
<?php	echo $wild->processSidebar($sidebar['aside']); ?>
</div><?php
endif;
?>
<div class="main">
    <h2><?php echo $page['Page']['title']; ?></h2>
    
    <div class="entry">
       <?php echo $wild->processWidgets($page['Page']['content']); ?> 
    </div>
    
    <?php echo $this->element('edit_this', array('id' => $page['Page']['id'])) ?>
</div>
