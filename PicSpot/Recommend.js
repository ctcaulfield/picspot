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
import Share from 'react-native-share'



const storage = firebase.storage()

// Prepare Blob support
const Blob = RNFetchBlob.polyfill.Blob
const fs = RNFetchBlob.fs
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
window.Blob = Blob

class Recommend extends React.Component {

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
  console.log("componentDidMount")
  this.fetchPhotos()
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

  let imagePath = null

        RNFetchBlob.config({
               fileCache : true
          })
         .fetch('GET', image)
         // the image is now dowloaded to device's storage
         .then((resp) => {
             // the image path you can use it directly with Image component
             imagePath = resp.path()
             return resp.readFile('base64')
         }).then((base64Data) => {
           console.log(base64Data);
           let shareOptions = {
             title: "React Native Share Example",
             message: "Check out this photo!",
             url: `data:image/jpg;base64,${base64Data}`,
             subject: "Check out this photo!"
           }
           Share.open(shareOptions)
             .then((res) => console.log('res:', res))
             .catch(err => console.log('err', err));
             // remove the file from storage
             return fs.unlink(imagePath)
         })
}

  changeEmotion = (value = "happy") => {
    this.setState({ emotion: value })
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <Header headerText={'PicSpot'} />
          <View style={{flexDirection: 'row'}}>
          <Button
            style = {{fontSize: 20, color: 'green'}}
            onPress={() => this.changeEmotion("joy")}
            title="#tbt"
            color="#3b3b3b"
            accessibilityLabel="Learn more about this purple button"
          />
          <Button
            onPress={() => this.changeEmotion("graduation")}
            title="#graduation"
            color="#3b3b3b"
            accessibilityLabel="Learn more about this purple button"
          />

          <Button
            onPress={() => this.changeEmotion("beach")}
            title="#beachday"
            color="#3b3b3b"
            accessibilityLabel="Learn more about this purple button"
          />
          <Button
            onPress={() => this.changeEmotion("vacation")}
            title=""
            color="#3b3b3b"
            accessibilityLabel="Learn more about this purple button"
          />
          </View>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {
            Object.keys(this.state.photos).map((image, i) => {
              let emotion = this.state.photos[image][0];
              let labels = this.state.photos[image][1];
              if(emotion == this.state.emotion || this.state.emotion in labels){
                return (
                  <TouchableHighlight
                    key={i}
                    onPress={() => this.share(image)}
                    underlayColor='transparent'
                  >
                    <Image
                      style={styles.imager}
                      source={{uri: image}}
                    />
                  </TouchableHighlight>
                )
              }
            })
          }
        </ScrollView>
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

export default Recommend
