<?php
class UsersController extends AppController {

    public $helpers = array('Wildflower.List', 'Time');
    public $pageTitle = 'User Accounts';

    /**
     * @TODO shit code, refactor
     *
     * Delete an user
     *
     * @param int $id
     */
    public function admin_delete($id) {
        $id = intval($id);
        if ($this->RequestHandler->isAjax()) {
            return $this->User->del($id);
        }

        if (empty($this->data)) {
            $this->data = $this->User->findById($id);
            if (empty($this->data)) {
                $this->indexRedirect();
            }
        } else {
            $this->User->del($this->data[$this->modelClass]['id']);
            $this->indexRedirect();
        }
    }

    /**
     * Login screen
     *
     */
    public function login() {
        $this->layout = 'login';   
        $this->pageTitle = 'Login';
        $User = ClassRegistry::init('User');

        // Try to authorize user with POSTed data
        if ($user = $this->Auth->user()) {
            if (!empty($this->data) && $this->data['User']['remember']) {
                // Generate unique cookie token
                $cookieToken = Security::hash(String::uuid(), null, true);
                
                while ($User->findByCookieToken($cookieToken)) {
                    $cookieToken = Security::hash(String::uuid(), null, true);
                }

                // Save token to DB
                $User->create($user);
                $User->saveField('cookie_token', $cookieToken);

                // Save login cookie
                $cookie = array();
                $cookie['login'] = $this->data['User']['login'];
                $cookie['cookie_token'] = $cookieToken;
                $this->Cookie->write('Auth.User', $cookie, true, '+2 weeks');
                unset($this->data['User']['remember']);
            }
            
            // Save last login time
            $User->create($user);
            $User->saveField('last_login', date('Y-m-d h:i:s', time()));
            
            $this->redirect($this->Auth->redirect());
        }

        // Try to authorize user with data from a cookie
        if (empty($this->data)) {
            $cookie = $this->Cookie->read('Auth.User');
            if (!is_null($cookie)) {
                $this->Auth->fields = array(
                    'username' => 'login', 
                    'password' => 'cookie_token'
                );
                if ($this->Auth->login($cookie)) {
                    //  Clear auth message, just in case we use it.
                    $this->Session->del('Message.auth');
                    
                    // Save last login time
                    $User->create($user);
                    $User->saveField('last_login', date('Y-m-d h:i:s', time()));
                    
                    return $this->redirect($this->Auth->redirect());
                } else { 
                    // Delete invalid Cookie
                    $this->Cookie->del('Auth.User');
                }
            }
        }
    }

    /**
     * Logout
     * 
     * Delete User info from Session, Cookie and reset cookie token.
     */
    public function admin_logout() {
        $this->User->create($this->Auth->user());
        $this->User->saveField('cookie_token', '');
        $this->Cookie->del('Auth.User');
        $this->redirect($this->Auth->logout());
    }

    public function admin_view($id) {
        $this->User->recursive = -1;
        $this->set('user', $this->User->findById($id));
    }

    /**
     * Users overview
     * 
     */
    public function admin_index() {
        $users = $this->User->find('all');
        $this->set(compact('users'));
    }
    
    public function admin_change_password($id = null) {
        $this->data = $this->User->findById($id);
    }

    /**
     * Create new user
     *
     */
    public function admin_create() {
        if ($this->User->save($this->data)) {
			// $this->__activation();
            return $this->redirect(array('action' => 'index'));
        }

        $users = $this->User->find('all');
        $this->set(compact('users'));
        $this->render('admin_index');
    }

    /**
     * Edit user account
     *
     * @param int $id
     */
    public function admin_edit($id = null) {
        $this->data = $this->User->findById($id);
        if (empty($this->data)) $this->cakeError('object_not_found');
    }
    
    public function admin_update() {
        unset($this->User->validate['password']);
        $this->User->create($this->data);
        if ($this->User->save()) {
            return $this->redirect(array('action' => 'edit', $this->User->id));
        }
        $this->render('admin_edit');
    }
    
    public function admin_update_password() {
        unset($this->User->validate['name'], $this->User->validate['email'], $this->User->validate['login']);
        App::import('Security');
        $this->data['User']['password'] = Security::hash($this->data['User']['password'], null, true);
        $this->User->create($this->data);
        if (!$this->User->exists()) $this->cakeError('object_not_found');
        if ($this->User->save()) {
            return $this->redirect(array('action' => 'edit', $this->data[$this->modelClass]['id']));
        }
        $this->render('admin_change_password');
    }

    /**
     * Register
     * 
     * add a user and send template activation email.
     */
    public function register() {
		
		$class = 'notice';
		$message = 'Sign up and be sent an activation email.';
		if($this->data)	{
			$class.= ' error';
			$message = 'Some explained error occured whoopsie, you entered data but we botched it up.';
			if ($this->User->save($this->data)) {
				// $this->__activation();
				$class = 'notice success';
				$message = 'You\'ve got mail!';
			}
		}
		$this->set(compact('message', 'class'));
	}

    /**
     * Reset a user id by user name
     * 
     * find user by username
     * resend activation email - disbale user util reset
     * display part of the email where the mail has been sent
     */
    public function reset() {
		$u = isset($this->data['User']['login']) ? $this->data['User']['login'] : false;
		$user = false;
		$class = 'notice';
		$message = 'Please enter your login, if successful a email will be sent with instructions to change and reactivate your account.';
		if($u)	{
			$user = $this->User->findByLogin($u);
			if($user['User']['login'] == $u)	{
				$this->set('email', $user['User']['login']);
				$message = 'An email will be sent to '.$user['User']['email'].'.';
				$class.= ' success';
				$this->__activation();
			} else {
				$class.= ' error';
				$message = 'Contact admin to and plead with them to resolve this issue on your behalf.';
			}
		}
		$this->set(compact('message', 'class'));
    }

    /**
     * Activation and reactivation email template sendout
     * 
     * add a user and send template activation email.
     */
    private function __activation() {
    }

}
