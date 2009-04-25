<div id="primary-content" class="main">

    <?php
        $cssClasses = array('link');
        if (isset($this->params['ChangeIndicator'])) {
            $changedId = $this->params['ChangeIndicator']['id'];
            if ($changedId == $link['WildLink']['id']) {
                array_push($cssClasses, 'changed');
                unset($this->params['ChangeIndicator']);
            }
        }
    ?>

	<div class="line">
    <?php foreach ($links as $link) { ?>
    <div class="unit size1of3<?php echo join(' ', $cssClasses) ?>" id="link-<?php echo $link['WildLink']['id'] ?>">
        <h2><?php echo $html->link($link['WildLink']['name'], WildLink::getUrl($link['WildLink']['uuid'])) ?></h2>
        <small class="link-date">Linked <?php echo $time->nice($link['WildLink']['created']) ?></small>
        
        <div class="entry">
            <?php echo $link['WildLink']['url'] ?>
        </div>
        
        <?php if (!empty($link['WildCategory'])) { ?>
        <p class="linkmeta">Linked in <?php echo $category->getList($link['WildCategory']) ?>.</p>
        <?php } ?>
        
        <?php echo $this->element('edit_this', array('id' => $link['WildLink']['id'])) ?>
        
    </div>
    <?php } ?>
	</div>
    <?php echo $this->element('wf_pagination') ?>
    
</div>
