<div class="youtube_video">
    <object width="<?php echo ((isset($width)) ? $width : 425); ?>" height="<?php echo ((isset($height)) ? $height : 344); ?>">
        <param name="movie" value="http://www.youtube.com/v/<?php echo $id ?>&hl=en&fs=1"></param>
        <param name="allowFullScreen" value="true"></param>
        <param name="allowscriptaccess" value="always"></param>
        <embed src="http://www.youtube.com/v/<?php echo $id ?>&hl=en&fs=1" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="<?php echo ((isset($width)) ? $width : 425); ?>" height="<?php echo ((isset($height)) ? $height : 344); ?>"></embed>
    </object>
</div> 