This page is <?php if ($this->data['WildPage']['draft']): ?>not published, therefore not visible to the public<?php else: ?>published and visible to the public at <?php echo $html->link(FULL_BASE_URL . $this->base . $this->data['WildPage']['url'], $this->data['WildPage']['url']); ?><?php endif; ?>. Latest changes were made <?php echo $time->nice($this->data['WildPage']['updated']); 
if($this->data['WildUser']) { 
	echo ' by ' . hsc($this->data['WildUser']['name']); 
} ?>.
