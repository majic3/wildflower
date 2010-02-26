<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="<?php	echo $width;	?>" height="<?php	echo $height;	?>" id="<?php	echo $id;	?>" name="<?php	echo $id;	?>"<?php	echo ($class) ? ' class="' . $class . '"' : '';	?>>
	<param name="movie" value="<?php	echo $file;	?>" />
	<?php	$Params = '';
		if(isset($params) && is_object($params)):
			foreach($params as $psetting => $param):
				if(is_bool($param)):
					$param = ($param) ? 'true' : 'false';
				endif;
				$Params.= '<param name="' . $psetting . '" value="' . $param . '" />' . "\n";
			endforeach;
			echo $Params;
		endif;	?>
	<!--[if !IE]>-->
	<object type="application/x-shockwave-flash" data="<?php	echo $file;	?>" width="<?php	echo $width;	?>" height="<?php	echo $height;	?>"<?php	echo (isset($class)) ? ' class="' . $class . '"' : '';	?>>
	<?php	echo $Params;	?>
	<!--<![endif]-->
		<?php	echo ($altContent) ? $altContent : '<a href="http://www.adobe.com/go/getflashplayer"><img src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" alt="Get Adobe Flash player" /></a>';	?>
	<!--[if !IE]>-->
	</object>
	<!--<![endif]-->
</object>