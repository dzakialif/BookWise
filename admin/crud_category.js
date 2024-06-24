// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getDatabase, set, ref, update, push, remove, onValue } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDfQFDdp63MMbrV4txPeACunFsAulv5K38',
  authDomain: 'bookwise-fca71.firebaseapp.com',
  projectId: 'bookwise-fca71',
  storageBucket: 'bookwise-fca71.appspot.com',
  messagingSenderId: '77745378217',
  appId: '1:77745378217:web:1cbca8213e84bdc80f6ab8',
  measurementId: 'G-MTQNNS7YW8',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.addEventListener('DOMContentLoaded', function () {
  // add category
  const addCategory = function () {
    window.addCategory = function () {
      window.location.href = 'addcategory.html';
    };
    const addCategoryId = document.getElementById('add-category-id').value.trim();
    const addCategoryTitle = document.getElementById('add-category-title').value.trim();
  
    if (addCategoryId && addCategoryTitle) {
      const dbRef = ref(database, 'category/');
  
      // Check for existing categoryId or categoryTitle
      onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        let exists = false;
  
        for (let id in data) {
          if (data[id].categoryId === addCategoryId || data[id].categoryTitle === addCategoryTitle) {
            exists = true;
            break;
          }
        }
  
        if (exists) {
          alert('Category ID atau Category Title sudah ada!');
        } else {
          push(dbRef, {
            categoryId: addCategoryId,
            categoryTitle: addCategoryTitle,
          })
            .then(() => {
              alert('Data berhasil ditambahkan!');
              document.getElementById('add-category-id').value = '';
              document.getElementById('add-category-title').value = '';
              window.location.href = 'category.html';
            })
            .catch((error) => {
              console.error(error);
              alert('Gagal menambahkan data!');
            });
        }
      }, {
        onlyOnce: true
      });
  
    } else {
      alert('Data tidak boleh kosong');
    }
  };
  // Event listener for add category form submission
  const addForm = document.getElementById('add-form');
  if (addForm) {
    addForm.addEventListener('submit', function (e) {
      e.preventDefault();
      addCategory(); // Call the addCategory function to handle form submission
    });
  }
  


 // edit category
 function editCategory() {
  window.editData = function (id, categoryId, categoryTitle) {
    window.location.href = `editcategory.html?id=${id}&categoryId=${encodeURIComponent(categoryId)}&categoryTitle=${encodeURIComponent(categoryTitle)}`;
  };
  const edit = new URLSearchParams(window.location.search);
  return {
    id: edit.get('id'),
    categoryId: edit.get('categoryId'),
    categoryTitle: edit.get('categoryTitle'),
  };
}
const { id, categoryId, categoryTitle } = editCategory();

if (categoryId && categoryTitle) {
  document.getElementById('edit-category-id').value = decodeURIComponent(categoryId);
  document.getElementById('edit-category-title').value = decodeURIComponent(categoryTitle);
}

const editForm = document.getElementById('edit-form');
if (editForm) {
  editForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const categoryUpdateId = document.getElementById('edit-category-id').value.trim();
    const categoryUpdateTitle = document.getElementById('edit-category-title').value.trim();

    if (categoryUpdateId && categoryUpdateTitle && id) {
      if (categoryUpdateId === categoryId && categoryUpdateTitle === categoryTitle) {
        alert('Data tidak ada perubahan');
        return; // Exit the function if no changes are made
      }

      const dbRef = ref(database, 'category/');

      // Check for existing categoryId or categoryTitle
      onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        let exists = false;

        for (let itemId in data) {
          if (itemId !== id && (data[itemId].categoryId === categoryUpdateId || data[itemId].categoryTitle === categoryUpdateTitle)) {
            exists = true;
            break;
          }
        }

        if (exists) {
          alert('Category ID atau Category Title sudah ada!');
        } else {
          const updateRef = ref(database, `category/${id}`);
          update(updateRef, {
            categoryId: categoryUpdateId,
            categoryTitle: categoryUpdateTitle,
          })
            .then(() => {
              alert('Data berhasil diperbarui!');
              window.location.href = 'category.html';
            })
            .catch((error) => {
              console.error('Gagal memperbarui data: ', error);
            });
        }
      }, {
        onlyOnce: true
      });

    } else {
      alert('Kategori tidak boleh kosong');
    }
  });
}
  // Read Category
  function readCategory() {
    const dataCategoryElement = document.getElementById('dataCategory');
    if (dataCategoryElement) {
      const dbRef = ref(database, 'category/');
      onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        dataCategoryElement.innerHTML = '';
        let count = 1;
        for (let id in data) {
          const row = `<tr>
                  <th scope="row">${count++}</th>
                  <td>${data[id].categoryId}</td>
                  <td>${data[id].categoryTitle}</td>
                  <td>
                    <button type="button" class="btn btn-warning" onclick="editData('${id}', '${encodeURIComponent(data[id].categoryId)}', '${encodeURIComponent(data[id].categoryTitle)}')">Edit</button>
                    <button type="button" class="btn btn-danger" onclick="deleteCategory('${id}')">Delete</button>
                  </td>
              </tr>`;
          dataCategoryElement.innerHTML += row;
        }
      });
    }
  }

  function deleteCategory(id) {
    const dbRef = ref(database, `category/${id}`);
    remove(dbRef)
      .then(() => {
        alert('Category berhasil dihapus!');
        readCategory(); // Call readCategory to refresh the data
      })
      .catch((error) => {
        console.error('Gagal menghapus Category: ', error);
      });
  }

  // Assign deleteCategory to window for global access
  window.deleteCategory = deleteCategory;

  readCategory();
});
