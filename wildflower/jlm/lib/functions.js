function ucwords(string) {
    return string.charAt(0).toUpperCase() + string.substr(1).toLowerCase();
}

/**
 * Testing for the occurence of a
 * if( name in oc(['bobby', 'sue','smith']) ) { ... }
 * http://snook.ca/archives/javascript/testing_for_a_v/
 * 
 * @param object / array
 */
function oc(a)	{
  var o = {};
  for(var i=0;i<a.length;i++)
  {
    o[a[i]]='';
  }
  return o;
}

/**
 * Wrapper for Firebug's console.debug()
 * 
 * If the browser does not support it nothing happens.
 * 
 * @param object Anything to display in Firebug console
 */
function debug(object) {
	if (window['console']) {
		console.debug(object);
	}
}

/**
 * Wrapper for Firebug's console.log()
 * 
 * If the browser does not support it nothing happens.
 * 
 * @param object Anything to display in Firebug console
 */
function log(object) {
	if (window['console']) {
		console.log(object);
	}
}
