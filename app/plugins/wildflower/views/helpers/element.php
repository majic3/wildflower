<?php 

/**
 * Element Helper
 * Helps formatting strings with custom markup
 * 
 * @author Stefan Zollinger
 * @license MIT
 * @version 1.0
 */

class ElementHelper extends Helper {

    /**
     * The base directory containing your elements.
     * Set to '' to include all elements in your views/elements folder
     */
    var $baseDir = 'templates';
    
    /**
     * Applies all the formatting defined in this helper
     * to $str
     * (Currently only $this->getElements() )
     * 
     * @return $str Formatted string 
     * @param string $str 
     */
    function format($str) {
        $str =& $this->getElements($str);
        return $str;
    }
    
    /**
     * 
     * Replaces [element:element_name] tags in a string with 
     * output from cakephp elements
     * Options can be defined as follows:
     *         [element:element_name id=123 otherVar=var1 nextvar="also with quotes"]
     *      [e:element_name]
     *  
     * @return formatted string 
     * @param $str string
     */
    function getElements(&$str){
        $View =& ClassRegistry::getObject('view');        
        preg_match_all('/\[(element|e):([A-Za-z0-9_\-]*)(.*?)\]/i', $str, $tagMatches);
        
        for($i=0; $i < count($tagMatches[1]); $i++){
            
            $regex = '/(\S+)=[\'"]?((?:.(?![\'"]?\s+(?:\S+)=|[>\'"]))+.)[\'"]?/i';
            preg_match_all($regex, $tagMatches[3][$i], $attributes);
            
            $element = $tagMatches[2][$i];
            $options = array();
            for($j=0; $j < count($attributes[0]); $j++){
                $options[$attributes[1][$j]] = $attributes[2][$j]; 
            }
            $str = str_replace($tagMatches[0][$i], $View->element($this->baseDir.DS.$element,$options), $str);
            
            
        }
        
        return $str;
    }
    
} 