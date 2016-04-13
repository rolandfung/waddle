// The first page you see when you open the app. Lets you log in (eventually with facebook),
// then directs you to the welcome page (if you're already in our db) or through the new user flow.

// Flowchart of scenes in the app:
// (made on http://asciiflow.com/)

// +------------+
// |Main / login|
// +-----+------+
//       |
//       |   new user    +------------+
//       +--------------->Tell us more+-----+
//       |               +------------+     |
//       |                                  |
//       |                                  |
//   +---v---+                           +--v---+
//   |Welcome<-----+                     |Selfie|
//   +---+---+     |                     +--+---+
//       |         |      +---------+       |
//       |         +------+LooksGood<-------+
//       |                +---------+
//   +---v---+
//   |Loading|
//   +---+---+
//       |
//       |
//       |
//   +---v---+
//   |Results|
//   +---+---+
//       |
//       |
//       |
//    +--v--+
//    |Match|
//    +-----+


var React = require('react-native');
var IP_address = require('../../environment.js').IP_address;

var {
  View,
  Text,
  StyleSheet,
  Component,
  TextInput,
  TouchableHighlight
} = React;

import Video from 'react-native-video'
var Welcome = require('./welcome');
var Signup = require('./signup');

var styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 30,
    marginTop: 65,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#48BBEC'
  },
  title: {
    marginBottom: 20,
    fontSize: 25,
    textAlign: 'center',
    color: '#fff'
  },
  textInput: {
    height: 50,
    padding: 4,
    marginRight: 5,
    fontSize: 23,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 8,
    color: 'white'
  },
  buttonText: {
    fontSize: 18,
    color: '#111',
    alignSelf: 'center'
  },
  button: {
    height: 45,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderColor: 'white',
    borderWidth: 0,
    borderRadius: 8,
    marginBottom: 10,
    marginTop: 10,
    alignSelf: 'stretch',
    justifyContent: 'center'
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  }
});

class Main extends Component{
  constructor(props){
    super(props);
    this.state = {
      username: '',
      error: false
    };
  }

  onLoad() {
    console.log('setting duration');
  }

  loadStart() {
    console.log('loading');
  }

  setTime() {
    console.log('making progress');
  }

  onEnd() {
    console.log('ending');
  }

  videoError(e) {
    console.log('error', e);
  }

  handleChange(e) {
    this.setState({
      username: e.nativeEvent.text
    });
  }

  handleSubmit(){
    console.log('insert OAuth integration here');
    var url = `${IP_address}/signin`;
    console.log('main.js handleSubmit POST to signin: ', url);
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: this.state.username
      })
    })
    .then(function(res){
      var isInvalid = /[\s&<>"'`=\/]/g.test(this.state.username);
      if (res.status == 200) {
        this.setState({
          error: false
        });
        console.log('main.js handleSubmit GET userInfo end point: ', `${IP_address}/users/${this.state.username}`);
        fetch(`${IP_address}/users/${this.state.username}`, {
          method: 'GET'
        })
        .then(function(response) {
          response.json().then(function(user) {
            console.log(user);
            this.props.navigator.push({
              title: "Welcome",
              component: Welcome,
              passProps: {
                username: this.state.username,
                firstName: user.firstName
              }
            });
          }.bind(this));

          // make it impossible to go back to sign in screen
          // passProps: {userInfo: res} 
          // should pass user ID, other details as received from OAuth
        }.bind(this));
      } else if (isInvalid) {
        this.setState({
          error: 'Invalid Username\n Please only use alphanumeric characters'
        });
      } else {
        this.props.navigator.push({
          title: 'Signup',
          component: Signup,
          passProps: {username: this.state.username}
        })
      }
    }.bind(this));

  }

  render(){
    var showErr = ( this.state.error ? <Text> {this.state.error} </Text> : <View></View> );
    return (
      <View style={styles.mainContainer}>
        <Video source={{uri:"background"}}
          style={styles.backgroundVideo}
          onLoadStart={this.loadStart} // Callback when video starts to load
          onLoad={this.setDuration}    // Callback when video loads
          onProgress={this.setTime}    // Callback every ~250ms with currentTime
          onEnd={this.onEnd}           // Callback when playback finishes
          onError={this.videoError} 
          paused={false}
          rate={1} volume={1} muted={true}
          resizeMode="cover" repeat={true}

        />
        <TextInput
          style={styles.textInput}
          autoCapitalize='none'
          autoCorrect={false}
          placeholder='Username'
          onChange={this.handleChange.bind(this)}
        />
        <TouchableHighlight
          style={styles.button}
          onPress={this.handleSubmit.bind(this)}
          underlayColor="rgba(255, 255, 255, 0.95)">
          <Text style={styles.buttonText}>Sign in</Text>
        </TouchableHighlight>
        {showErr}
      </View>
    )
  }
};

module.exports = Main;
