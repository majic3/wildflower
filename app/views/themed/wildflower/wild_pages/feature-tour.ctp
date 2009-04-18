<?php
/**
 * Wildflower/Icing loads this template for home page.
 * Place any other templates for pages in this directory.
 *
 * You can overwrite this by placing a home.ctp file inside app/views/wild_pages/home.ctp
 *
 * @package wildflower
 */
?>
	<div class="main">
		<div class="line">
			<div class="pageHeader size1of1 unit">
				<?php echo $html->link($html->image('/wildflower/thumbnail/' . $page['WildPage']['custom_fields'][0]['value'] . '/768'), $page['WildPage']['custom_fields'][1]['value'], array(), false, false); ?>
			</div>
			<div class="size3of4 unit">
				<h2><?php echo $page['WildPage']['title']; ?></h2>
				<?php echo $wild->processWidgets($page['WildPage']['content']); ?>
				<h5>Quiet Stuff</h5>
				<p>
				Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.

				<p class="small">The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.
				</p>
			</div>
			<div class="size1of4 lastUnit">
				<?php
				echo $html->image('jQuery_logo_color_onwhite.png'), ' ', $html->image('jQuery__UI_logo_color_onwhite.png');
				?>
				<div id="twitter" class="mod basic">
					<b class="top"><b class="tl"></b><b class="tr"></b></b> 
					<div class="inner">
						<div class="hd"><h3>Sub Pages</h3></div>
						<div class="bd"><ul><li><a href="/feature-tour/jquery-ui">jquery ui</a></li></ul></div>
					</div>
					<b class="bottom"><b class="bl"></b><b class="br"></b></b>
				</div>
				<hr />
				<?php echo $wild->processWidgets($page['WildPage']['sidebar_content']); ?>
			</div>
		</div>
	</div>

	<?php echo $this->element('edit_this', array('id' => $page['WildPage']['id'])) ?>
<script type="text/javascript">
$(function(){

// Accordion
$("#accordion").accordion({ header: "h3" });

// Tabs
$('#tabs').tabs();


// Dialog
$('#dialog').dialog({
autoOpen: false,
width: 600,
buttons: {
"Ok": function() {
$(this).dialog("close");
},
"Cancel": function() {
$(this).dialog("close");
}
}
});

// Dialog Link
$('#dialog_link').click(function(){
$('#dialog').dialog('open');
return false;
});

// Datepicker
$('#datepicker').datepicker({
inline: true
});

// Slider
$('#slider').slider({
range: true,
values: [17, 67]
});

// Progressbar
$("#progressbar").progressbar({
value: 20
});

//hover states on the static widgets
$('#dialog_link, ul#icons li').hover(
function() { $(this).addClass('ui-state-hover'); },
function() { $(this).removeClass('ui-state-hover'); }
);

});
</script>