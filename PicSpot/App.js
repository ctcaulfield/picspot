/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react'
import {
  Platform,
  View,
  Text,
  Modal,
  StyleSheet,
  Button,
  CameraRoll,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';

// import * as firebase from 'firebase'
import Share from 'react-native-share'
import Header from './header';


let styles
const { width } = Dimensions.get('window')



import ImagePicker from 'react-native-image-crop-picker';
import RNFetchBlob from 'react-native-fetch-blob';
import firebase from 'firebase'

//Init Firebase
//used for storing images
const config = {
  apiKey: "AIzaSyCpMgKVCcylMqp9PllquFrE6lCgPGcRwE0",
  authDomain: "image-storage-95d02.firebaseapp.com",
  databaseURL: "https://image-storage-95d02.firebaseio.com",
  projectId: "image-storage-95d02",
  storageBucket: "image-storage-95d02.appspot.com",
  messagingSenderId: "538388620086"
}

//initalizing firebase
firebase.initializeApp(config)
//variable storage which references the firebase storage
const storage = firebase.storage()

// Prepare Blob support
const Blob = RNFetchBlob.polyfill.Blob
const fs = RNFetchBlob.fs
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
window.Blob = Blob


const uploadImage = (uri, imageName, mime = 'image/jpg') => {
  // checks if connected to firebase
  var connectedRef = firebase.database().ref(".info/connected");
  connectedRef.on("value", function(snap) {
    if (snap.val() === true) {
      console.log("connected");
    } else {
      console.log("not connected");
    }
  });

  //create promise to firebase
  return new Promise((resolve, reject) => {
    const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
    const sessionId = new Date().getTime()
    let uploadBlob = null
    const imageRef = firebase.storage().ref('images').child(`${imageName}`)
    fs.readFile(uploadUri, 'base64')
      .then((data) => {
        return Blob.build(data, { type: `${mime};BASE64` })
      })
      .then((blob) => {
        uploadBlob = blob
        return imageRef.put(blob, { contentType: mime })
      })
      .then(() => {
        uploadBlob.close()
        return imageRef.getDownloadURL()
      })
      .then((url) => {
        resolve(url)
      })
      .catch((error) => {
        reject(error)
    })
  })
}

visionApi = (requestData) => {
  return new Promise((resolve, reject) => {
    console.log("api working....")
    console.log(requestData);
    const API_URL = 'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBPF9K4U4OiBKrxziL-rJKJQW57_jH0ClI';
    const http = new XMLHttpRequest();
    http.open("POST",API_URL,true);
    http.setRequestHeader('Accept','application/json');
    http.send(JSON.stringify(requestData));
    http.onreadystatechange = function(){
      if(http.readyState === XMLHttpRequest.DONE && http.status === 200) {
        var json = JSON.parse(http.responseText);
        console.log(json);
        const faces = json.responses[0].faceAnnotations;
        console.log(faces);
        const labels = json.responses[0].labelAnnotations;
        var allLabels={};
        labels.forEach((label) => allLabels[label.description] = label.score);
        console.log(allLabels);
       var fin_faces = [];
       faces.forEach((face, i) => {
         var emotion_obj = {
             "joy":face.joyLikelihood,
             "anger":face.angerLikelihood,
             "sorrow":face.sorrowLikelihood,
             "surprise":face.surpriseLikelihood
         }
         for (var key in emotion_obj) {
           // console.log(emotion_obj[key],key); // likelihood emotion
           if(emotion_obj[key] == "VERY_LIKELY"){
             fin_faces.push(key);
           }
         }
       }
     );
         var  count = {};
         var emotion = null;
         fin_faces.forEach(function(i) { count[i] = (count[i]||0) + 1;});
         var i = 0;
         for (var key in count) {
           if(i<count[key]){
             emotion = key;
             i = count[key];
           }
         }
         resolve([emotion,allLabels]);

      }
  }
  })
  // end of promise
}


class App extends React.Component {
   static navigationOptions = {
        title: "Picspot",
        tabBarLabel: "Profile",
        tabBarIcon: ({ tintColor }) => (
            <Image
                source={require("./icons/profile.png")}
                style={[styles.icon2, {tintColor: tintColor}]}
            />
        ),
    };

  state = {
    photos: [],
    index: null
  }

  setIndex = (index) => {
    if (index === this.state.index) {
      index = null
    }
    this.setState({ index })
  }

  //user selects images
  pickImage() {
    //select image library
    ImagePicker.openPicker({
      includeExif: true,
      multiple: true,
      maxFiles: 20
    }).then(images => {
      //loop through each image object in images
      images.forEach(image => {
        //upload image to firebase
        uploadImage(image.path, image.filename)
        //return url of image location in firebase
          .then((url) => {
            const requestData = {
              "requests": [
                 {
                   "image": {
                     "source": {
                       "imageUri": url
                     }
                   },
                   "features": [
                     {
                       "type":"LABEL_DETECTION"
                     },
                     {
                       "type":"face_DETECTION"
                     }
                   ]
                 }
               ]
             }
             visionApi(requestData).then(function(emotion){
                // Get a key for a new Post.
                 var postData = {
                   labels: emotion[1],
                   emotion: emotion[0],
                   imageUrl: image.filename,
                   metadata: image.exif
                 };
                 let newPostKey = firebase.database().ref().child('images').push().key;
                 // Write the new post's data simultaneously in the posts list and the user's post list.
                 let updates = {};
                 updates['/images/' + newPostKey] = postData;
                 firebase.database().ref().update(updates);
             })


        })
        .catch(error => console.log(error))
      }
      );

    }).catch(e => console.log(e));
  }

  navigateUpload = () => {
    const { navigate } = this.props.navigation
    navigate('Categorize',{photos: this.state.photos})
    // navigate('Categorize',{photos: this.state.photos})
  }

  render() {
    console.log('state :', this.state)
    return (
      <View>
      <Header headerText={'PicSpot'} returnValue={null} />
        <Button
          title='Upload'
          onPress={ () => this.pickImage() }
        />
      </View>
    )
  }
}

styles = StyleSheet.create({
  icon2: {
        width: 26,
        height: 26,
    }
})

export default App
