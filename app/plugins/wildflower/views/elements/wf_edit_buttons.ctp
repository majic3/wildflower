<div class="submit" id="save-preview">
    <input type="submit" value="<?php __('Preview'); ?>" />
</div>

<?php if ($isDraft): ?>    
    
<div class="submit" id="save-draft">
    <input type="submit" value="<?php __('Save, but don\'t publish'); ?>" name="data[__save][draft]" />
</div>

<div class="submit" id="save-publish">
    <input type="submit" value="<?php __('Publish'); ?>" name="data[__save][publish]" />
</div>

<?php else: ?>
    
<div class="submit" id="save-draft">
    <input type="submit" value="<?php __('Save as the newest version'); ?>" />
</div>

<!-- div class="buttons"> <?php //__('or'); ?> <?php //echo $html->link(__('Cancel', true), array('action' => 'view', (isset($this->data['WildPost'])) ? $this->data['WildPost']['id'] : $this->data['WildPage']['id'])); ?></div -->