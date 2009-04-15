<ul class="tabs"><?php 
foreach($adminCustomSettings as $k)	{
	if(!empty($k))	echo '<li><a href="#' . $k . '">' . $k . '</a></li>';
}
?></ul>