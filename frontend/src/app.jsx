import React, { Component } from 'react';
import './app.css';
import axios from 'axios';
import logo from './img/atlassian-logo-auth.png';
import auth from './img/auth-icon.png';
import logout from './img/logout.png';
import CheckboxGroup from './components/CheckboxGroup';

class App extends Component {
  constructor(props) {
    super(props);
    this.client = axios.create({
      baseURL: 'http://localhost:4000/api/v1/',
      timeout: 3000,
      headers: { 'Accept': 'application/json' },
    });

    this.state = {
      key: '',
      isAuthenticated: false,
      user: null,
      token: '',
      a_token: '',
      "repoSelections": [],
      "repoSelectionsFullName": [],
      "selectedRepo": [] 
    }
    this.bitbucketLogin = this.bitbucketLogin.bind(this);
    this.logout = this.logout.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleRepoSelection = this.handleRepoSelection.bind(this);
    this.authenticate = this.authenticate.bind(this);
    this.showPullRequests = this.showPullRequests.bind(this);
    this.getUsername = this.getUsername.bind(this);
  }

  //method for logging in
  bitbucketLogin() {
    let key = 'rgQLhdVKatRay6gGKz';
    window.location = `https://bitbucket.org/site/oauth2/authorize?client_id=${key}&response_type=token`;
  }

  //method for authenticating user
  authenticate(key) {
    let that = this;
    this.client.post('/auth/bitbucket', {
      access_token: key
    })
      .then(response => {
        this.client = axios.create({
          baseURL: 'http://localhost:4000/api/v1/',
          timeout: 3000,
          headers: { 'x-auth-token': response.headers['x-auth-token'] }
        });

        let jsonResponse = response.config.data;
        let resObject = JSON.parse(jsonResponse);

        that.setState({
          isAuthenticated: true,
          token: response.headers['x-auth-token'],
          user: response.data,
          key: key,
          a_token: resObject.access_token
        });
        that.getUsername();
      })
      .catch(error => {
        console.log(error);
        that.setState({ isAuthenticated: false, token: '', user: null, key: key });
      });
  }

  //method for logging out
  logout() {
    this.setState({ isAuthenticated: false, token: '', user: null })
  }
  // method for showing pull requests of selected repositories 
  handleFormSubmit(e) {
    e.preventDefault();

    this.state.selectedRepo.forEach(item => {
      this.showPullRequests(item);
    });
  }

  //method for showing pull requests
  showPullRequests(item) {
    axios.get(`https://bitbucket.org/!api/2.0/repositories/${item}/pullrequests`)
      .then((otvet) => {
        let json = otvet.request.response;
        let obj = JSON.parse(json);

        if (obj.values.length <= 0) {
          alert("No pull requests to show");
        }
        else {
          obj.values.forEach(i => {
            window.open(i.links.html.href, "_blank");
          });
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  //method for handling checked repositories
  handleRepoSelection(e) {
    const newSelection = e.target.value;
    let newSelectionArray;
    if (this.state.selectedRepo.indexOf(newSelection) > -1) {
      newSelectionArray = this.state.selectedRepo.filter(s => s !== newSelection)
    } else {
      newSelectionArray = [...this.state.selectedRepo, newSelection];
    }
    this.setState({ selectedRepo: newSelectionArray }, () => console.log('selectedRepo', this.state.selectedRepo));
  }


  //method make get request in order to get username
  getUsername() {
    axios.get(`https://bitbucket.org/!api/2.0/user?access_token=%7B+${this.state.a_token}`)
      .then((res) => {
        this.getRepoList(res.data.username);
      })
      .catch(function (error) {
        console.log(error);
      })
  }

  //method make get request in order to get list of repositories
  getRepoList(name) {
    axios.get(`https://bitbucket.org/!api/2.0/repositories/${name}?access_token=` + this.state.key)
      .then((r) => {
        this.setState(prevState => ({
          repoSelections: [...prevState.repoSelections, ...r.data.values.map(item => item.name)],
          repoSelectionsFullName: [...prevState.repoSelections, ...r.data.values.map(item => item.full_name)]
        }));
        this.setState({ selectedRepo: this.state.repoSelectionsFullName });
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  componentDidMount() {
    let params = window.location.hash.split('&');
    if (params.length > 0 && params[0].startsWith('#access_token=')) {
      let key = decodeURIComponent(params[0].replace('#access_token=', ''));
      this.authenticate(key);
    }
  }

  render() {
    let content = !!this.state.isAuthenticated ?
      (
        <div className="auth">
          <div className="auth-left">
            <img src={logo} alt="attlasian-logo-auth" className="auth-icon-bitbucket" />
            <div className="auth-status hover">
              <img src={auth} alt="auth-icon" className="auth-icon" />
              <span style={{ marginLeft: 20 }}>Authenticated</span>
            </div>
            <div className="auth-status" onClick={this.logout}>
              <img src={logout} alt="logout-icon" className="logout-icon" />
              <span style={{ marginLeft: 20 }}>Log out</span>
            </div>
          </div>
          <div className="auth-right">
            <div className="repositories">
              Repositories
            </div>
            <p className="repositories-sub">
              Select repositories to view
            </p>
            <form className="container" onSubmit={this.handleFormSubmit}>
              <CheckboxGroup
                setName={'repositories'}
                type={'checkbox'}
                controlFunc={this.handleRepoSelection}
                options={this.state.repoSelectionsFullName}
                selectedOptions={this.state.selectedRepo} />
              <input
                type="submit"
                className="submit-btn"
                value="Submit" />
            </form>
          </div>
        </div>
      ) :
      (
        <div className="App">
          <div className="atlassian_logo"></div>
          <hr className="divider" />
          <div className="bitbucket_logo"></div>
          <button onClick={this.bitbucketLogin} className="login-button">
            Bitbucket Login
        </button>
        </div>
      );
    return (
      <div>
        {content}
      </div>
    );
  }
}

export default App; 
