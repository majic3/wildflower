// on the dashboards we want feeds using gfeed
$.jlm.bind('wild_dashboards.wf_index', function() { 
	$('a.feed').gFeed( { target: '#dashFeeds', tabs: true } ); 
});
