import Navigation from './components/Navigation/Navigation';
import './App.css';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';

import { useState } from 'react';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import ParticlesContainer from './components/ParticlesContainer/ParticlesContainer';

const initialState = {
  box: {
    leftCol: '',
    topRow: '',
    rightCol: '',
    bottomRow: '',
  },
  user: {
    id: '',
    email: '',
    name: '',
    entries: 0,
    joined: '',
  },
};
function App() {
  const [input, setInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [route, setRoute] = useState('signin');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [box, setBox] = useState(initialState.box);
  const [user, setUser] = useState(initialState.user);

  const handleSignOut = () => {
    setUser(initialState.user);
    setBox(initialState.box);
    setRoute('signout');
    setIsSignedIn(false);
  };

  const loadUser = (data) => {
    setUser((user) => ({ ...user, ...data }));
  };

  const calculateFaceLocation = (data) => {
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height,
    };
  };

  const displayFaceBox = (data) => {
    setBox(data);
  };

  const onInputChange = (event) => {
    setInput(event.target.value);
  };

  const onButtonSubmit = () => {
    setImageUrl(input);
    fetch(`${process.env.REACT_APP_API_URL}imageurl`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: input,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res) {
          fetch(`${process.env.REACT_APP_API_URL}image`, {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: user.id,
            }),
          })
            .then((res) => res.json())
            .then((count) =>
              setUser((user) => ({ ...user, entries: count.entries }))
            )
            .catch(console.log);
        }
        displayFaceBox(calculateFaceLocation(res));
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className='App'>
      <ParticlesContainer />
      <Navigation
        isSignedIn={isSignedIn}
        onRouteChange={setRoute}
        handleSignOut={handleSignOut}
      />
      {route === 'home' ? (
        <>
          <Logo />
          <Rank name={user.name} entries={user.entries} />
          <ImageLinkForm
            onInputChange={onInputChange}
            onButtonSubmit={onButtonSubmit}
          />
          <FaceRecognition box={box} imageUrl={imageUrl} />
        </>
      ) : route === 'signin' ? (
        <Signin
          loadUser={loadUser}
          onRouteChange={setRoute}
          onIsSignInChange={setIsSignedIn}
        />
      ) : (
        <Register
          loadUser={loadUser}
          onRouteChange={setRoute}
          onIsSignInChange={setIsSignedIn}
        />
      )}
    </div>
  );
}

export default App;
