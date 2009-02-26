// on the dashboards we want feeds using gfeed
$.jlm.bind('wild_dashboards.wf_index', function() { 
	console.log('wild dashboards');
	$('a.feed').gFeed( { target: '#dashFeeds', tabs: true } ); 
});
