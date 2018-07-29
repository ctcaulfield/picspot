import React, { Component } from 'react'
import {
  StyleSheet,
  NetInfo,
  Text,
  Button,
  ScrollView,
  Dimensions,
  ListView,
  View,
  TouchableHighlight,
  TouchableOpacity,
  NativeModules,
  Platform,
  Image,
  ActivityIndicator
} from 'react-native'

const { width, height } = Dimensions.get('window');
import Header from './header';
import ImagePicker from 'react-native-image-crop-picker';
import RNFetchBlob from 'react-native-fetch-blob';
import firebase from 'firebase';


const storage = firebase.storage()

// Prepare Blob support
const Blob = RNFetchBlob.polyfill.Blob
const fs = RNFetchBlob.fs
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
window.Blob = Blob

class Similar extends React.Component {

   static navigationOptions = {
        tabBarLabel: "Discover",
        tabBarIcon: ({ tintColor }) => (
            <Image
                source={require("./icons/discover.png")}
                style={[styles.icon2, {tintColor: tintColor}]}
            />
        ),
    };

  state = {
    photos: {},
    emotion: "happy",
    index: null,
    loading: false
  }

componentDidMount() {
  console.log("componentDidMount");
  this.fetchPhotos();
}

fetchPhotos = () => {
  this.setState({ loading: true })
  let ref = firebase.database().ref().child('images');

  ref.once('value', snap => {
      snap.forEach( item => {
        //Create a reference to the file we want to download
          let storageRef = firebase.storage().ref('images/'+item.val().imageUrl);
            //Get the download URL
            storageRef.getDownloadURL().then( url =>  {
              var colleciton = [item.val().emotion,item.val().labels]
              this.state.photos[url] = colleciton;
              //this.state.photos.push(url)
              this.setState({ photos: this.state.photos, loading: false})
            });
      });
  });
}
  //share selected image
  share = (image) => {
    RNFetchBlob.fs.readFile(image, 'base64')
    .then((data) => {
      let shareOptions = {
        title: "React Native Share Example",
        message: "Check out this photo!",
        url: 'data:image/jpg;base64,${data}',
        subject: "Check out this photo!"
      }

      Share.open(shareOptions)
        .then((res) => console.log('res:', res))
        .catch(err => console.log('err', err))
    })
  }

  changeEmotion = (value = "happy") => {
    this.setState({ emotion: value })
  }

  render() {
    const { goBack } = this.props.navigation;
    return (
      <View style={{flex: 1}}>
        <Header headerText={'PicSpot'} />
          <Button
            title="Go back"
            onPress={() => goBack()}
          />
      </View>
    )
  }
}

styles = StyleSheet.create({
  scrollContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  imager: {
    width: width / 1, height: width / 1
  },
  image: {
    width: width / 3, height: width / 3
  },
  icon2: {
        width: 26,
        height: 26,
    },
  icon:{
    width: 25,
    height: 25,
    paddingLeft:15,
    paddingRight:15,
    paddingTop:15,
    paddingBottom:15
  },
  title: {
    textAlign: 'center',
    padding: 20
  }
})

export default Similar
