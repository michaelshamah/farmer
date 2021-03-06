import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  TabBarIOS,
  Image
} from 'react-native';
import {
  Container,
  Content,
  Card,
  CardItem,
  Text,
  View,
  Header,
  Title,
  Button,
  Tabs,
  Spinner
} from 'native-base';
import Icon       from 'react-native-vector-icons/FontAwesome'

import Search     from './components/Search'
import Homepage   from './components/Homepage'
import Login      from './components/Login'
import SignUp     from './components/SignUp'
import Post       from './components/Post'
import FarmerFeed from './components/FarmerFeed'
import Profile    from './components/Profile'
import Market     from './components/Market'
import styles     from './components/styles'

import AjaxAdapter from './helpers/ajaxAdapter.js'

const ajax = new AjaxAdapter(fetch);

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      position: {
        coords: {
          latitude: '40.72975',
          longitude: '-73.98682'
        },
      },
      zip: '10003',
      location_name: '',
      markets: [],
      showLogin: false,
      showGuest: false,
      showSignUp: false,
      showFarmer: false,
      farmerIdLoggedIn: '',
      isFarmerHere: false,
      selectedTab: 'search',
      loading: true,
      onHome: true,
      currentPosts: [{
        farmer_name: '',
        content: 'No Posts, yet.',
        post_created: null
      }],
      farmerPosts: [{
        farmer_name: '',
        market_name: '',
        content: 'No Posts, yet.',
        post_created: null
      }]
    };
  }

  componentDidMount() {
    let here = this

    // navigator.geolocation.getCurrentPosition(
    //   (position) => {
    //     console.log(position)
    //     this.setState({position})

        ajax.getZip(here.state.position.coords.longitude, here.state.position.coords.latitude)
          .then((address)=>{
            ajax.getMrktsByZip(address.zip)
              .then((data)=>{
                this.setState({
                  markets: data,
                  zip: address.zip,
                  location_name: address.name,
                  loading: false
                })
                console.log(this.state.zip, this.state.location_name)
              })
          })
    //   }
    // );
  }

  showLogin(){
    this.setState({
      onHome: false,
      showLogin: true,
      showSignUp: false,
      showFarmer: false,
      showGuest: false
    })
  }

  showSignUP(){
    this.setState({
      onHome: false,
      showSignUp: true,
      showLogin: false,
      showFarmer: false,
      showGuest:false
    })
  }

  showGuest(){
    this.setState({
      onHome: false,
      showGuest: true,
      showFarmer: false,
      showLogin: false,
      showSignUp: false,
      farmerIdLoggedIn: '',
      farmerNameLoggedIn: '',
      isFarmerHere: false,
      oneMarketClicked: false,
      marketClicked: ''
    })
  }

  getMarkets(zip) {
    this.setState({
      loading:true
    })

    ajax.getMrktsByZip(zip)
      .then((data)=>{
        this.setState({
          markets: data,
          zip: zip,
          location_name: data[0].city,
          loading:false
        })
        console.log(this.state.zip, this.state.location_name)
      })
      .catch(err=>{
        console.log("error getting markets: ", err)
        this.setState({
          markets: null,
          loading:false
        })
      })
  }

  showOneMarket(market){
    this.setState({
      oneMarketClicked: true,
      marketClicked: market
    })

    this.getPostsByMName(market.market_name);
  }

  getSavedMktById(){
    this.setState({
      loading: true
    })

    let farmer_id = this.state.farmerIdLoggedIn

    ajax.getMDataByFId(farmer_id)
      .then(r=>{
        if(r.market_id){
          ajax.getMrktById(r.market_id)
            .then((data)=>{
              console.log("From get Market by Id: ", data)
              this.setState({
                farmersMarkets: data,
                loading: false,
                market_name: data.market_name,
                market_id: r.market_id
              })
              ajax.getPostsByMName(data.market_name)
                .then(data=>{
                  console.log("From get Posts: ", data)
                  this.setState({
                    currentPosts: data,
                    loading:false
                  })
                })
                .catch(err=>{
                  if(err) console.log("From get posts, error: ",err)
                })
            })
        } else {
          console.log("market_id is undefined: ", r.market_id)
          this.setState({
            market_name: '',
            market_id: null,
            loading:false,
            farmersMarkets: null
          })
        }
      })
      .catch(err=>{
        console.log("no markets: ", err)
      })
  }

  getPostsByMName(market_name){
    ajax.getPostsByMName(market_name)
      .then(data=>{
        console.log("From get Posts: ", data)
        this.setState({
          currentPosts: data,
          loading:false
        })
      })
      .catch(err=>{
        if(err) console.log("From get posts, error: ",err)
      })
  }

  getPostsByFId(){
    let farmer_id = this.state.farmerIdLoggedIn

    ajax.getPostsByFId(farmer_id)
      .then(data=>{
        console.log("Farmer Posts: ", data)
        this.setState({
          farmerPosts: data
        })
      })
      .catch(err=>{
        console.log("error getting posts from farmer: ", err)
      })
  }

  removeFromFarmer(market_id, farmer_id) {
    ajax.removeMarket(market_id, farmer_id)
      .then(data=>{
        this.setState({
          market_name: '',
          market_id: null
        })
      })
  }

  loginFarmer(farmer_id, farmer_name, market_id){
    this.setState({
      showFarmer: true,
      showLogin: false,
      showSignUp: false,
      showGuest:false,
      onHome: false,
      farmerIdLoggedIn: farmer_id,
      farmerNameLoggedIn: farmer_name,
      isFarmerHere: true,
      selectedTab: 'post'
    })
  }

  handlePost(postContent){
    ajax.addPost(postContent)
      .then((data)=>{
        console.log(data)
        this.setState({
          selectedTab: 'feed'
        })
      })
  }

  /*
                     |
  ,---.,---.,---.,---|,---.,---.
  |    |---'|   ||   ||---'|
  `    `---'`   '`---'`---'`
  */
  render() {
    if(this.state.onHome) {
      return(
        <Homepage
          login   ={this.showLogin.bind(this)}
          signUp  ={this.showSignUP.bind(this)}
          skip    ={this.showGuest.bind(this)} />
      )
    } else if(!this.state.onHome) {
      return (
        <View>
          {this.state.showFarmer ?
            <Header>
              <Title>
                <Image source={require('./images/header.png')} />
              </Title>
            </Header>
            : <Header>
                <Button transparent onPress={this.showLogin.bind(this)}>
                  Login
                </Button>
                <Title>
                  <Image source={require('./images/header.png')} />
                </Title>
                <Button transparent onPress={this.showSignUP.bind(this)}>
                  Create
                </Button>
              </Header>
          }
        {/*
                            |
        ,---..   .,---.,---.|---
        |   ||   ||---'`---.|
        `---|`---'`---'`---'`---'
        `---'
        */}
          {this.state.showGuest ?
            <TabBarIOS
              selectedTab={this.state.selectedTab}
              unselectedTintColor="#333"
              tintColor="crimson">
              <Icon.TabBarItem
                selected={this.state.selectedTab === 'search'}
                iconName="crosshairs"
                title="Locate"
                onPress={() => {
                  this.getMarkets('10003');
                  this.setState({
                    selectedTab: 'search'
                  });
                }}>
                {this.state.loading?
                  <Spinner color="blue"/>
                  : this.state.oneMarketClicked ?
                    <Market
                      marketClicked   ={this.state.marketClicked}
                      currentPosts    ={this.state.currentPosts}
                      getPosts        ={this.getPostsByMName.bind(this)}
                      showGuest       ={this.showGuest.bind(this)} />
                    : <Search
                        marketData    ={this.state.markets}
                        location      ={this.state.location_name}
                        getMarkets    ={this.getMarkets.bind(this)}
                        showOneMarket ={this.showOneMarket.bind(this)} />
                }
              </Icon.TabBarItem>
            </TabBarIOS>
        /*
        ,---.
        |__. ,---.,---.,-.-.,---.,---.
        |    ,---||    | | ||---'|
        `    `---^`    ` ' '`---'`
        */
            : this.state.showFarmer ?
              <TabBarIOS
                selectedTab={this.state.selectedTab}
                unselectedTintColor="#333"
                tintColor="crimson">
                <Icon.TabBarItem
                  selected={this.state.selectedTab === 'feed'}
                  iconName="asterisk"
                  title="Feed"
                  onPress={() => {
                    this.getSavedMktById();
                    this.setState({
                      selectedTab: 'feed'
                    });
                  }}>
                  <FarmerFeed
                    marketData    ={this.state.farmersMarkets}
                    location      ={this.state.location_name}
                    isFarmerHere  ={this.state.isFarmerHere}
                    farmerId      ={this.state.farmerIdLoggedIn}
                    farmerName    ={this.state.farmerNameLoggedIn}
                    currentPosts  ={this.state.currentPosts} />
                </Icon.TabBarItem>
                <Icon.TabBarItem
                  title='Post'
                  iconName="edit"
                  selected={this.state.selectedTab === 'post'}
                  onPress={() => {
                    this.getSavedMktById();
                    this.setState({
                      selectedTab: 'post'
                    });
                  }}>
                  <Post
                    farmerName  ={this.state.farmerNameLoggedIn}
                    farmerId    ={this.state.farmerIdLoggedIn}
                    marketName  ={this.state.market_name}
                    post        ={this.handlePost.bind(this)} />
                </Icon.TabBarItem>
                <Icon.TabBarItem
                  selected={this.state.selectedTab === 'search'}
                  iconName="crosshairs"
                  title="Locate"
                  onPress={() => {
                    this.getSavedMktById();
                    this.getMarkets('10003');
                    this.setState({
                      selectedTab: 'search'
                    });
                  }}>
                  <Search
                    marketData    ={this.state.markets}
                    location      ={this.state.location_name}
                    getMarkets    ={this.getMarkets.bind(this)}
                    isFarmerHere  ={this.state.isFarmerHere}
                    farmerId      ={this.state.farmerIdLoggedIn}
                    market_name   ={this.state.market_name}
                    getMarketById ={this.getSavedMktById.bind(this)}
                    currentPosts  ={this.state.currentPosts} />
                </Icon.TabBarItem>
                <Icon.TabBarItem
                  selected={this.state.selectedTab === 'profile'}
                  iconName="user"
                  title="Profile"
                  onPress={() => {
                    this.getSavedMktById();
                    this.getPostsByFId();
                    this.setState({
                      selectedTab: 'profile'
                    });
                  }}>
                  <Profile
                    market_name ={this.state.market_name}
                    market_id   ={this.state.market_id}
                    farmerName  ={this.state.farmerNameLoggedIn}
                    farmerId    ={this.state.farmerIdLoggedIn}
                    removeMarket={this.removeFromFarmer.bind(this)}
                    showGuest   ={this.showGuest.bind(this)}
                    farmerPosts ={this.state.farmerPosts}
                    getMarkets  ={this.getMarkets.bind(this)} />
                </Icon.TabBarItem>
              </TabBarIOS>
              : null
          }
        {/*
        |              o        /     o
        |    ,---.,---..,---.  / ,---..,---.,---..   .,---.
        |    |   ||   |||   | /  `---.||   ||   ||   ||   |
        `---'`---'`---|``   '/   `---'``---|`   '`---'|---'
                  `---'                `---'          |
        */}
          {this.state.showLogin ?
            <Content>
              <Header><Title>LOGIN</Title></Header>
              <Login toggleLogin={this.loginFarmer.bind(this)} />
              {!this.state.showGuest ?
                <Button bordered block danger style={styles.margin} onPress={this.showGuest.bind(this)}>
                  Skip & Search Markets
                </Button>
                : null }
            </Content>
          : this.state.showSignUp ?
            <Content>
              <Header><Title>SIGN UP AS A FARMER</Title></Header>
              <SignUp toggleLogin={this.loginFarmer.bind(this)} />
              {!this.state.showGuest ?
                <Button bordered block danger style={styles.margin} onPress={this.showGuest.bind(this)}>
                  Skip & Search Markets
                </Button>
                : null }
            </Content>
            : null
          }
        </View>
      )
    }
  }
}

AppRegistry.registerComponent('farmer', () => App);
