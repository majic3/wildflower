<?php 
App::import(array('Model', 'AppModel', 'File', 'Security'));

class WildflowerShell extends Shell {
	public $uses = array('WildUser');
	// install? big ambition upgrade
	var $tasks = array('ClearCache', 'ShowCache', 'ResetPass');

	function initialize() {
        // empty
    }

    function main() {
        $this->out('Wildflower Shell');
        $this->hr();

        if (count($this->args) === 0) {
            $action = $this->in('Please enter the action Password Reset, Migrate Database quit (p|m|c|q):');
        } else {
			$var = '';
            $action = $this->args[0];

			if(array_key_exists(1, $this->args))	{
				$var = $this->args[1];
			}

			if($action == 'p')	{
				$this->hash();
			} elseif($action == 'm') {
				$this->ruckusing();
			} elseif($action == 'c') {
				$this->cache();
			}
        }
    }

    function help() {
        $this->out('Wildlfower Shell Help');
    }

    /**
     * Output run tasks to clear wf cache files
     *
     * @return void
     */
    function cache() {
    }

    /**
     * Output new password
     *
     * @return password
     */
    function hash() {
		$this->ResetPass->execute();
    }
    
    /**
     * Launch Ruckusing database migrations shell
     *
     * Since it's launched in the CakePHP shell you can use all the 
     * CakePHP magic inside the migrations. Super sweet.
     *
     * @return void
     */
    function ruckusing() {
        define('RUCKUSING_BASE', dirname(__FILE__) . DS . '..' . DS . 'ruckusing');
        require_once RUCKUSING_BASE . '/lib/classes/util/class.Ruckusing_Logger.php';
        require_once RUCKUSING_BASE . '/config/database.inc.php';
        require_once RUCKUSING_BASE . '/lib/classes/class.Ruckusing_FrameworkRunner.php';
        $argv = $this->args;
        array_unshift($argv, "vendors/ruckusing/main.php");
        $main = new Ruckusing_FrameworkRunner($ruckusing_db_config, $argv);
        $main->execute();
    }
    
}

