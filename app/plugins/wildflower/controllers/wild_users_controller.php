<?php
class WildUsersController extends WildflowerAppController {

    public $helpers = array('Wildflower.List', 'Time');
    public $pageTitle = 'User Accounts';

    /**
     * @TODO shit code, refactor
     *
     * Delete an user
     *
     * @param int $id
     */
    function wf_delete($id) {
        $id = intval($id);
        if ($this->RequestHandler->isAjax()) {
            return $this->WildUser->del($id);
        }

        if (empty($this->data)) {
            $this->data = $this->WildUser->findById($id);
            if (empty($this->data)) {
                $this->indexRedirect();
            }
        } else {
            $this->WildUser->del($this->data[$this->modelClass]['id']);
            $this->indexRedirect();
        }
    }

    /**
     * Login screen
     *
     */
    function login() {
        $this->layout = 'login';   
        $this->pageTitle = 'Login';

        if ($user = $this->Auth->user()) {
            if (!empty($this->data) && $this->data['WildUser']['remember']) {
                // Generate unique cookie token
                $cookieToken = Security::hash(String::uuid(), null, true);
                $WildUser = ClassRegistry::init('WildUser');
                while ($WildUser->findByCookieToken($cookieToken)) {
                    $cookieToken = Security::hash(String::uuid(), null, true);
                }

                // Save token to DB
                $WildUser->create($user);
                $WildUser->saveField('cookie_token', $cookieToken);

                // Save login cookie
                $cookie = array();
                $cookie['login'] = $this->data['WildUser']['login'];
                $cookie['cookie_token'] = $cookieToken;
                $this->Cookie->write('Auth.WildUser', $cookie, true, '+2 weeks');
                unset($this->data['WildUser']['remember']);
            }
            $this->redirect($this->Auth->redirect());
        }

        // Try login cookie
        if (empty($this->data)) {
            $cookie = $this->Cookie->read('Auth.WildUser');
            if (!is_null($cookie)) {
                $this->Auth->fields = array('username' => 'login', 'password' => 'cookie_token');
                if ($this->Auth->login($cookie)) {
                    //  Clear auth message, just in case we use it.
                    $this->Session->del('Message.auth');
                    return $this->redirect($this->Auth->redirect());
                } else { 
                    // Delete invalid Cookie
                    $this->Cookie->del('Auth.User');
                }
            }
        }
    }

    /**
     * reset password
     * 
     * Three stage process to reset password first sent link then click link to reset the new pass is sent to address
     */
    function resetpass() {	
        $this->layout = 'login';   
        $this->pageTitle = 'Reseting password';
        $useroremail = Sanitize::paranoid($this->params['useroremail']);
		if(is_null($useroremail))	{
			// first stage
			$email = '';
			$stage = 1;	   
				$type = 'notice';
				$message = 'We need to scope you out a bit please tell us your email / username and we will send you a link to reset your password';
		}	elseif(is_string($useroremail) && (strlen($useroremail) !== 40))	{
			// second stage - if param is a valid username or email address for a user then send new password to this user
			$email = $useroremail;
			$stage = 2;		
			$user = $this->WildUser->find(array('email' => $email));
			$type = 'notice';
			$message = "a link has been sent to you address use that link to have another pass generated and sent to <strong>$email</strong>";

			if (empty($user)) {
				$type = 'alert';
				$message = "It looks asif your up to things you should'nt be doing!! <strong>$email</strong>";
			}	else {
        		// @TODO: Akismet validation in model
        		$this->Email->to = $user['User']['email'];
        		$this->Email->from = Configure::read('AppSettings.contact_email');
        		$this->Email->replyTo = Configure::read('AppSettings.contact_email');
        		$this->Email->subject = Configure::read('AppSettings.site_name') . ' Password Reset';
        		$this->Email->sendAs = 'text';
        		$this->Email->template = 'password_reset';	
				$resetlink = sha1(date('w') . Configure::read('Security.salt') . date('m') . $user['User']['password'] . date('Y'));
        		$this->set('message', "If this is an error then ignore this email but you should perhaps change the password");
			}

		}	else	{
			// check hash is a hash we want to know - it should be a sha1 of (day salt currentpass month)
			if(1 ==5)	{
				$email = '';
				$type = 'success';
				$message = 'You have been reapproved your new pass has been sent';
			}	else	{
				$email = '';
				$type = 'alert';
				$message = 'You not a real person according to us';
			}
			$stage = 3;
		}
			$this->set(compact('stage', 'email', 'message', 'type'));
    }

    /**
     * Logout
     * 
     * Delete User info from Session, Cookie and reset cookie token.
     */
    function wf_logout() {
        $this->WildUser->create($this->Auth->user());
        $this->WildUser->saveField('cookie_token', '');
        $this->Cookie->del('Auth.WildUser');
        $this->redirect($this->Auth->logout());
    }

    function wf_view($id) {
        $this->WildUser->recursive = -1;
        $this->set('user', $this->WildUser->findById($id));
    }

    /**
     * Users overview
     * 
     */
    function wf_index() {
        $users = $this->WildUser->findAll();
        $this->set(compact('users'));
    }
    
    function wf_change_password($id = null) {
        $this->data = $this->WildUser->findById($id);
    }

    /**
     * Create new user
     *
     */
    function wf_create() {
        if ($this->WildUser->save($this->data)) {
            return $this->redirect(array('action' => 'index'));
        }

        $users = $this->WildUser->find('all');
        $this->set(compact('users'));
        $this->render('wf_index');
    }

    /**
     * Edit user account
     *
     * @param int $id
     */
    function wf_edit($id = null) {
        $this->data = $this->WildUser->findById($id);
        if (empty($this->data)) $this->cakeError('object_not_found');
    }
    
    function wf_update() {
        unset($this->WildUser->validate['password']);
        $this->WildUser->create($this->data);
        if ($this->WildUser->save()) {
            return $this->redirect(array('action' => 'edit', $this->WildUser->id));
        }
        $this->render('admin_edit');
    }
    
    function wf_update_password() {
        unset($this->WildUser->validate['name'], $this->WildUser->validate['email'], $this->WildUser->validate['login']);
        App::import('Security');
        $this->data['WildUser']['password'] = Security::hash($this->data['WildUser']['password'], null, true);
        $this->WildUser->create($this->data);
        if (!$this->WildUser->exists()) $this->cakeError('object_not_found');
        if ($this->WildUser->save()) {
            return $this->redirect(array('action' => 'edit', $this->data[$this->modelClass]['id']));
        }
        $this->render('wf_change_password');
    }

}
