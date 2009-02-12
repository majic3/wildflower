<?php
if (Configure::read('debug') < 1) {
    echo 'var gaID = "' . Configure::read('AppSettings.google_analytics_code') . '" /* Google Analytic turned off in debug mode.*/';
} else {
	echo 'var gaID = null; /* Google Analytic turned off in debug mode.*/';
}
?>