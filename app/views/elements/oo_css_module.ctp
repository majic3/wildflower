<div class="mod <?php	echo ($fancy) ? $fancy : 'simple'; ?>">
	<?php if($fancy): ?>
    <b class="top"><b class="tl"></b><b class="tr"></b></b> 
	<?php endif; ?>
    <div class="inner">
	<?php if($title): ?>
        <div class="hd">
            <h3><?php echo $title;?></h3>
        </div>
	<?php endif; ?>
        <div class="bd">
            <?php echo ($content);?>
        </div>
	<?php if($foot): ?>
        <div class="ft">
            <h3><?php echo ($foot);?></h3>
        </div>
	<?php endif; ?>
    </div>
	<?php if($fancy): ?>
    <b class="bottom"><b class="bl"></b><b class="br"></b></b> 
	<?php endif; ?>
</div>
