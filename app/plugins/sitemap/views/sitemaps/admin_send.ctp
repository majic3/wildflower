<?php 
$this->pageTitle = 'Send SiteMap';
// wf has this $javascript->link('jquery-1.3.2.min.js', false);
?>
<h1>
	Send SiteMap
</h1>

<table cellpadding="0" cellspacing="0">
	<tr>
		<th>Site</th>
		<th>Status</th>
		<th>Action</th>
	</tr>
	<tr>
		<td>
			Google
		</td>
		<td>
			<div id="results_google">Not Send</div>
		</td>
		<td>
			<?php echo $form->create('Sitemap', array('action' => 'ping_google', 'type' => 'get', 'id' => 'ping_google') );?>
			<?php echo $form->end('Send');?>
		</td>
	</tr>
	<tr>
		<td>
			Ask
		</td>
		<td>
			<div id="results_ask">Not Send</div>
		</td>
		<td>
			<?php echo $form->create('Sitemap', array('action' => 'ping_ask', 'type' => 'get', 'id' => 'ping_ask') );?>
			<?php echo $form->end('Send');?>
		</td>
	</tr>
	<tr>
		<td>
			Yahoo
		</td>
		<td>
			<div id="results_yahoo">Not Send</div>
		</td>
		<td>
			<?php echo $form->create('Sitemap', array('action' => 'ping_yahoo', 'type' => 'get', 'id' => 'ping_yahoo') );?>
			<?php echo $form->end('Send');?>
		</td>
	</tr>
	<tr>
		<td>
			Bing
		</td>
		<td>
			<div id="results_bing">Not Send</div>
		</td>
		<td>
			<?php echo $form->create('Sitemap', array('action' => 'ping_bing', 'type' => 'get', 'id' => 'ping_bing') );?>
			<?php echo $form->end('Send');?>
		</td>
	</tr>
</table>
<p>move this scriptblock in to jlm</p>
<script language="javascript" type="text/javascript">
//<![CDATA[
	var GoogleForm = 'ping_google';
	var GoogleResult = 'results_google';
	var AskForm = 'ping_ask';
	var AskResult = 'results_ask';
	var YahooForm = 'ping_yahoo';
	var YahooResult = 'results_yahoo';
	var BingForm = 'ping_bing';
	var BingResult = 'results_bing';

	var msgProgress = 'Sending SiteMap...';
	var msgOK = 'Sended and received OK';
	var msgFail = 'Error, sitemap not sended';

	$(document).ready(function(){
		$('#' + GoogleForm).submit(processGoogle);
		$('#' + AskForm).submit(processAsk);
		$('#' + YahooForm).submit(processYahoo);
		$('#' + BingForm).submit(processBing);

	});

	function showresults(divid, data){
		$("#"+divid).html(data);
		$("#"+divid).css({width: "0%"}).animate({width: "100%"}, 'slow');
	}

	function parseresults(data) {
		var bgcolor = '900';
		var textcolor = 'FFF';
		var message = msgFail;
		if($.trim(data) == "success") {
			var bgcolor = '090';
			var textcolor = 'FFF';
			var message = msgOK;
		}
		return '<div style="background:#'+bgcolor+'; color:#'+textcolor+'; padding: 10px;">'+message+'<\/div>';
	}

	function processGoogle(event){
		event.preventDefault();
		$("#" + GoogleResult).html(msgProgress);
		$.get("<?php echo Router::url(array('action' => 'ping_google'), true); ?>", null, function(data) {
			showresults(GoogleResult, parseresults(data));
		});
	}

	function processAsk(event){
		event.preventDefault();
		$("#" + AskResult).html(msgProgress);
		$.get("<?php echo Router::url(array('action' => 'ping_ask'), true); ?>", null, function(data) {
			showresults(AskResult, parseresults(data));
		});
	}

	function processYahoo(event){
		event.preventDefault();
		$("#" + YahooResult).html(msgProgress);
		$.get("<?php echo Router::url(array('action' => 'ping_yahoo'), true); ?>", null, function(data) {
			showresults(YahooResult, parseresults(data));
		});
	}    

	function processBing(event){
		event.preventDefault();
		$("#" + BingResult).html(msgProgress);
		$.get("<?php echo Router::url(array('action' => 'ping_bing'), true); ?>", null, function(data) {
			showresults(BingResult, parseresults(data));
		});
	}    
//]]>
</script> 