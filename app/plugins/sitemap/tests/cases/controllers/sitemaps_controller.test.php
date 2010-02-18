<?php 
/* SVN FILE: $Id$ */
/* SitemapsController Test cases generated on: 2010-02-18 05:58:22 : 1266472702*/
App::import('Controller', 'Sitemap.Sitemaps');

class TestSitemaps extends SitemapsController {
	var $autoRender = false;
}

class SitemapsControllerTest extends CakeTestCase {
	var $Sitemaps = null;

	function startTest() {
		$this->Sitemaps = new TestSitemaps();
		$this->Sitemaps->constructClasses();
	}

	function testSitemapsControllerInstance() {
		$this->assertTrue(is_a($this->Sitemaps, 'SitemapsController'));
	}

	function endTest() {
		unset($this->Sitemaps);
	}
}
?>