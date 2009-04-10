<?php
class AppModel extends Model {

    /**
     * Get data for select box
     * 
     * @param int $skipId id to skip
     */
    function getListThreaded($skipId = null, $alias = 'title') {
        $condition = null;
        if (is_numeric($skipId)) {
            // Ignore the page for which we're looking for parents
            $condition = "{$this->name}.{$this->primaryKey} != $skipId";
        }
        $parentPages = $this->findAll($condition, null, "$alias ASC", null, 1, 0); // @TODO findAll depracated
        // Array for form::select
        if (!empty($parentPages)) {
            $parentPages = array_combine(
                Set::extract($parentPages, '{n}.' . $this->name . ".{$this->primaryKey}"),
                Set::extract($parentPages, '{n}.' . $this->name . ".$alias"));
        }
        return $parentPages;
    }

    /**
     * Find a path to an item in MPTT tree
     *
     * @param int $tree_left Left tree value
     * @param int $tree_right Right tree value
     * @return array Ancestors ordered from top to bottom
     */
    function findPath($tree_left, $tree_right, $fields = null) {
        $ancestors = $this->findAll(
                "{$this->name}.lft < $tree_left AND {$this->name}.rght > $tree_right",
                $fields, 
                "{$this->name}.lft ASC");
        return $ancestors;
    }
    
    /**
     * Overloading AppModel invalidate to include l18n
     *
     * @param string $field
     * @param bool $value
     */
    function invalidate($field, $value = true) {
        return parent::invalidate($field, __($value, true));
    }

	function doSearch($query)	{
    	$fields = array('id', 'title', 'slug');
    	$titleResults = $this->find('all', Array('conditions' => Array("{$this->name}.title LIKE '%$query%'"), 'fields' => $fields));
    	$contentResults = array();
    	if (empty($titleResults)) {
    		$titleResults = array();
			$contentResults = $this->find('all', Array('conditions' => Array("MATCH ({$this->name}.content) AGAINST '%$query%'"), 'fields' => $fields));
		} else {
			$alredyFoundIds = join(', ', Set::extract($titleResults, '{n}.WildPost.id'));
			$notInQueryPart = '';
			$conditions['AND'][] = "match ({$this->name}.content) AGAINST ('$query')";
			if (!empty($alredyFoundIds)) {
				$conditions['AND'][] = "{$this->name}.id NOT IN ($alredyFoundIds)";
			}
			$contentResults = $this->find('all', Array('conditions' => $conditions, 'fields' => $fields));
		}

		if (!is_array(($contentResults))) {
			$contentResults = array();
		}

		$results = array_merge($titleResults, $contentResults);
		return $results;
	}

}
