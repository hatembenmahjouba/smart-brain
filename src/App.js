import Navigation from './components/Navigation/Navigation';
import './App.css';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';

import { useEffect, useState } from 'react';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import ParticlesContainer from './components/ParticlesContainer/ParticlesContainer';
import Modal from './components/Modal/Modal';
import Profile from './components/Profile/Profile';

const initialState = {
  boxes: [],
  user: {
    id: '',
    email: '',
    name: '',
    entries: 0,
    joined: '',
    pet: '',
    age: '',
  },
};
function App() {
  const [input, setInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [route, setRoute] = useState('signin');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [boxes, setBoxes] = useState(initialState.boxes);
  const [user, setUser] = useState(initialState.user);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const token = window.sessionStorage.getItem('token');
    if (token) {
      fetch(`${process.env.REACT_APP_API_URL}signin`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      })
        .then((resp) => resp.json())
        .then((data) => {
          if (data && data.id) {
            fetch(`${process.env.REACT_APP_API_URL}profile/${data.id}`, {
              headers: {
                'Content-Type': 'application/json',
                Authorization: token,
              },
            })
              .then((resp) => resp.json())
              .then((user) => {
                if (user && user.email) {
                  loadUser(user);
                  setRoute('home');
                  setIsSignedIn(true);
                }
              });
          }
        })
        .catch(console.log);
    }
  }, []);

  const handleSignOut = () => {
    fetch(`${process.env.REACT_APP_API_URL}signout`, {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json',
        Authorization: window.sessionStorage.getItem('token'),
      },
    });

    setUser(initialState.user);
    setBoxes(initialState.box);
    setRoute('signin');
    setIsSignedIn(false);
    window.sessionStorage.removeItem('token');
  };

  const loadUser = (data) => {
    setUser((user) => ({ ...user, ...data }));
  };

  const calculateFaceLocation = (data) => {
    if (data && data.outputs) {
      return data.outputs[0].data.regions.map((face) => {
        const clarifaiFace = face.region_info.bounding_box;
        const image = document.getElementById('inputimage');
        const width = Number(image.width);
        const height = Number(image.height);
        return {
          leftCol: clarifaiFace.left_col * width,
          topRow: clarifaiFace.top_row * height,
          rightCol: width - clarifaiFace.right_col * width,
          bottomRow: height - clarifaiFace.bottom_row * height,
        };
      });
    }
    return;
  };

  const displayFaceBoxes = (boxes) => {
    if (boxes) {
      setBoxes(boxes);
    }
  };

  const onInputChange = (event) => {
    setInput(event.target.value);
  };

  const onButtonSubmit = () => {
    setImageUrl(input);
    fetch(`${process.env.REACT_APP_API_URL}imageurl`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: window.sessionStorage.getItem('token'),
      },
      body: JSON.stringify({
        input: input,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.status === 200 || res.status === 304) {
          fetch(`${process.env.REACT_APP_API_URL}image`, {
            method: 'put',
            headers: {
              'Content-Type': 'application/json',
              Authorization: window.sessionStorage.getItem('token'),
            },
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
        displayFaceBoxes(calculateFaceLocation(res));
      })
      .catch((err) => console.log(err));
  };

  const toggleModal = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <div className='App'>
      <ParticlesContainer />
      <Navigation
        isSignedIn={isSignedIn}
        onRouteChange={setRoute}
        handleSignOut={handleSignOut}
        toggleModal={toggleModal}
      />
      {isProfileOpen && (
        <Modal>
          <Profile
            isProfileOpen={isProfileOpen}
            loadUser={loadUser}
            toggleModal={toggleModal}
            user={user}
          />
        </Modal>
      )}
      {route === 'home' ? (
        <>
          <Logo />
          <Rank name={user.name} entries={user.entries} />
          <ImageLinkForm
            onInputChange={onInputChange}
            onButtonSubmit={onButtonSubmit}
          />
          <FaceRecognition boxes={boxes} imageUrl={imageUrl} />
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
