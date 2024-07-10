import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getDatabase, ref, push, get, child, set } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDfQFDdp63MMbrV4txPeACunFsAulv5K38',
  authDomain: 'bookwise-fca71.firebaseapp.com',
  projectId: 'bookwise-fca71',
  storageBucket: 'bookwise-fca71.appspot.com',
  messagingSenderId: '77745378217',
  appId: '1:77745378217:web:1cbca8213e84bdc80f6ab8',
  measurementId: 'G-MTQNNS7YW8',
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);

let formRegist = document.getElementById('form-regist');
let formLogin = document.getElementById('form-login');

let RegisterUser = (event) => {
  event.preventDefault();

  let nama = document.getElementById('nama').value;
  let nohp = document.getElementById('nohp').value;
  let emailSignup = document.getElementById('emailSignup').value;
  let passwordSignup = document.getElementById('passwordSignup').value;
  let timestamp = Date.now();

  createUserWithEmailAndPassword(auth, emailSignup, passwordSignup)
    .then((userCredential) => {
      const user = userCredential.user;
      const userData = {
        nama: nama,
        nohp: nohp,
        email: emailSignup,
        timestamp: timestamp,
        userType: 'user'
      };

      // Simpan informasi pengguna ke localStorage
      localStorage.setItem('nama', nama);
      localStorage.setItem('nohp', nohp);
      localStorage.setItem('email', emailSignup);
      localStorage.setItem('userType', 'user'); // default userType sebagai 'user'
      localStorage.setItem('timestamp', timestamp.toString()); // konversi ke string karena localStorage hanya bisa menyimpan string

      // Gunakan child() untuk membuat path dengan uid
      return set(ref(database, 'user/' + user.uid), userData).then(() => {
        console.log('User data saved:', userData);
        alert('Berhasil Registrasi');
        formRegist.reset(); // Reset form registrasi
        document.querySelector('.container').classList.remove('sign-up-mode'); // Pindahkan ke form login
      });
    })
    .catch((error) => {
      const errorMessage = error.message;
      alert(errorMessage);
    });
};

formRegist.addEventListener('submit', RegisterUser);

let SigninUser = (event) => {
  event.preventDefault();

  let emailSignin = document.getElementById('emailSignin').value;
  let passwordSignin = document.getElementById('passwordSignin').value;

  signInWithEmailAndPassword(auth, emailSignin, passwordSignin)
    .then((userCredential) => {
      const user = userCredential.user;
      const userRef = ref(database, 'user/' + user.uid);
      let timestamp = Date.now(); // mendapatkan timestamp saat ini

      return get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          console.log('User data retrieved:', userData);

          // Simpan informasi pengguna ke localStorage untuk digunakan di halaman lain
          localStorage.setItem('nama', userData.nama);
          localStorage.setItem('nohp', userData.nohp);
          localStorage.setItem('email', userData.email);
          localStorage.setItem('userType', userData.userType);
          localStorage.setItem('timestamp', timestamp.toString());

          window.location.href = 'dashboard.html';
        } else {
          alert('Data pengguna tidak ditemukan');
        }
      });
    })
    .catch((error) => {
      const errorMessage = error.message;
      alert(errorMessage);
    });
};
formLogin.addEventListener('submit', SigninUser);

