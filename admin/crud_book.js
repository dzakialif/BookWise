// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getDatabase, ref, update, push, remove, onValue } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';

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
const storage = getStorage(app);

document.addEventListener('DOMContentLoaded', function () {
  // Function to populate category select dropdown
  function populateCategorySelect(categoryId) {
    const categorySelect = document.getElementById(categoryId);
    if (!categorySelect) {
      console.error(`Category select element with ID ${categoryId} not found!`);
      return;
    }

    const dbRef = ref(database, 'category/');
    onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        console.error("No data available from Firebase.");
        return;
      }

      categorySelect.innerHTML = '<option value="">Select Category</option>';
      for (let id in data) {
        const option = document.createElement('option');
        option.value = data[id].categoryId;
        option.text = data[id].categoryId;
        categorySelect.appendChild(option);
      }
    });
  }

  // Call populateCategorySelect when the DOM is fully loaded
  if (document.getElementById('add-book-id')) {
    populateCategorySelect('add-category-id');
  }

  if (document.getElementById('edit-book-id')) {
    populateCategorySelect('edit-category-id');
  }

  // Add Book
  const addBook = function () {
    const addBookId = document.getElementById('add-book-id').value.trim();
    const addBookTitle = document.getElementById('add-book-title').value.trim();
    const addCategoryId = document.getElementById('add-category-id').value.trim();
    const addBookPublished = document.getElementById('add-book-published').value.trim();
    const addBookAuthor = document.getElementById('add-book-author').value.trim();
    const addBookIsbn = document.getElementById('add-book-isbn').value.trim();
    const addBookFile = document.getElementById('add-book-file').files[0]; // Get the selected file

    if (addBookId && addBookTitle && addCategoryId && addBookPublished && addBookAuthor && addBookIsbn && addBookFile) {
      const dbRef = ref(database, 'book/');

      // Check for existing ISBN
      onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        let exists = false;

        for (let id in data) {
          if (data[id].bookId === addBookId || data[id].bookTitle === addBookTitle || data[id].bookAuthor === addBookAuthor || data[id].bookIsbn === addBookIsbn) {
            exists = true;
            break;
          }
        }

        if (exists) {
          alert('Data Sudah Ada!');
        } else {
          // Upload file to Firebase Storage
          const fileRef = storageRef(storage, 'books/' + addBookFile.name);
          uploadBytes(fileRef, addBookFile).then((snapshot) => {
            getDownloadURL(snapshot.ref).then((url) => {
              // Save book data with the file URL
              push(dbRef, {
                bookId: addBookId,
                bookTitle: addBookTitle,
                categoryId: addCategoryId,
                bookPublished: addBookPublished,
                bookAuthor: addBookAuthor,
                bookIsbn: addBookIsbn,
                bookFile: url,
              })
                .then(() => {
                  alert('Data berhasil ditambahkan!');
                  document.getElementById('add-book-id').value = '';
                  document.getElementById('add-book-title').value = '';
                  document.getElementById('add-category-id').value = '';
                  document.getElementById('add-book-published').value = '';
                  document.getElementById('add-book-author').value = '';
                  document.getElementById('add-book-isbn').value = '';
                  document.getElementById('add-book-file').value = '';
                  window.location.href = 'book.html';
                })
                .catch((error) => {
                  console.error(error);
                  alert('Gagal menambahkan data!');
                });
            }).catch((error) => {
              console.error('Error getting download URL: ', error);
              alert('Gagal mengupload file!');
            });
          }).catch((error) => {
            console.error('Error uploading file: ', error);
            alert('Gagal mengupload file!');
          });
        }
      }, {
        onlyOnce: true
      });
    } else {
      alert('Data tidak boleh kosong');
    }
  };

  const bookForm = document.getElementById('book-form');
  if (bookForm) {
    bookForm.addEventListener('submit', function (e) {
      e.preventDefault();
      addBook();
    });
  }

  // Edit Book
  function editBook() {
    window.editData = function (id, bookId, bookTitle, categoryId, bookPublished, bookAuthor, bookIsbn, bookFile) {
      window.location.href = `editbook.html?id=${id}&bookId=${encodeURIComponent(bookId)}&bookTitle=${encodeURIComponent(bookTitle)}&categoryId=${encodeURIComponent(categoryId)}&bookPublished=${encodeURIComponent(bookPublished)}&bookAuthor=${encodeURIComponent(bookAuthor)}&bookIsbn=${encodeURIComponent(bookIsbn)}&bookFile=${encodeURIComponent(bookFile)}`;
    };
    const edit = new URLSearchParams(window.location.search);
    return {
      id: edit.get('id'),
      bookId: edit.get('bookId'),
      bookTitle: edit.get('bookTitle'),
      categoryId: edit.get('categoryId'),
      bookPublished: edit.get('bookPublished'),
      bookAuthor: edit.get('bookAuthor'),
      bookIsbn: edit.get('bookIsbn'),
      bookFile: edit.get('bookFile'),
    };
  }

  const { id, bookId, bookTitle, categoryId, bookPublished, bookAuthor, bookIsbn, bookFile } = editBook();

  if (bookId && bookTitle && categoryId && bookPublished && bookAuthor && bookIsbn && bookFile) {
    document.getElementById('edit-book-id').value = decodeURIComponent(bookId);
    document.getElementById('edit-book-title').value = decodeURIComponent(bookTitle);
    document.getElementById('edit-category-id').value = decodeURIComponent(categoryId);
    document.getElementById('edit-book-published').value = decodeURIComponent(bookPublished);
    document.getElementById('edit-book-author').value = decodeURIComponent(bookAuthor);
    document.getElementById('edit-book-isbn').value = decodeURIComponent(bookIsbn);
    document.getElementById('edit-book-file').value = decodeURIComponent(bookFile);
  }

  const editForm = document.getElementById('edit-form');
  if (editForm) {
    editForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const bookUpdateId = document.getElementById('edit-book-id').value.trim();
      const bookUpdateTitle = document.getElementById('edit-book-title').value.trim();
      const bookUpdateCategoryId = document.getElementById('edit-category-id').value.trim();
      const bookUpdatePublished = document.getElementById('edit-book-published').value.trim();
      const bookUpdateAuthor = document.getElementById('edit-book-author').value.trim();
      const bookUpdateIsbn = document.getElementById('edit-book-isbn').value.trim();
      const bookUpdateFile = document.getElementById('edit-book-file').value.trim();

      if (bookUpdateId && bookUpdateTitle && bookUpdateCategoryId && bookUpdatePublished && bookUpdateAuthor && bookUpdateIsbn && bookUpdateFile && id) {
        // Periksa apakah data berubah
        if (bookUpdateTitle === decodeURIComponent(bookTitle) &&
          bookUpdateCategoryId === decodeURIComponent(categoryId) &&
          bookUpdatePublished === decodeURIComponent(bookPublished) &&
          bookUpdateAuthor === decodeURIComponent(bookAuthor) &&
          bookUpdateIsbn === decodeURIComponent(bookIsbn) &&
          bookUpdateFile === decodeURIComponent(bookFile)) {
          alert('Data tidak ada perubahan');
          return; // Exit the function if no changes are made
        }

        const dbRef = ref(database, 'book/');

        // Check for existing bookTitle
        onValue(dbRef, (snapshot) => {
          const data = snapshot.val();
          let exists = false;

          for (let itemId in data) {
            if (itemId !== id && data[itemId].bookTitle === bookUpdateTitle) {
              exists = true;
              break;
            }
          }

          if (exists) {
            alert('Judul buku sudah ada!');
          } else {
            const updateRef = ref(database, `book/${id}`);
            update(updateRef, {
              bookId: bookUpdateId,
              bookTitle: bookUpdateTitle,
              categoryId: bookUpdateCategoryId,
              bookPublished: bookUpdatePublished,
              bookAuthor: bookUpdateAuthor,
              bookIsbn: bookUpdateIsbn,
              bookFile: bookUpdateFile,
            })
              .then(() => {
                alert('Data berhasil diperbarui!');
                window.location.href = 'book.html';
              })
              .catch((error) => {
                console.error('Gagal memperbarui data: ', error);
              });
          }
        }, {
          onlyOnce: true
        });

      } else {
        alert('Buku tidak boleh kosong');
      }
    });
  }

  // Read Books
  function readBooks() {
    const dataBookElement = document.getElementById('dataBook');
    if (dataBookElement) {
      const dbRef = ref(database, 'book/');
      onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        dataBookElement.innerHTML = '';
        let count = 1;
        for (let id in data) {
          const row = `<tr>
                  <th scope="row">${count++}</th>
                  <td>${data[id].bookId}</td>
                  <td>${data[id].bookTitle}</td>
                  <td>${data[id].categoryId}</td>
                  <td>${data[id].bookPublished}</td>
                  <td>${data[id].bookAuthor}</td>
                  <td>${data[id].bookIsbn}</td>
                  <td>${data[id].bookFile}</td>
                  <td>
                    <button type="button" class="btn btn-warning" onclick="editData('${id}', '${encodeURIComponent(data[id].bookId)}', '${encodeURIComponent(data[id].bookTitle)}', '${encodeURIComponent(data[id].categoryId)}', '${encodeURIComponent(data[id].bookPublished)}', '${encodeURIComponent(data[id].bookAuthor)}', '${encodeURIComponent(data[id].bookIsbn)}', '${encodeURIComponent(data[id].bookFile)}')">Edit</button>
                    <button type="button" class="btn btn-danger" onclick="deleteBook('${id}')">Delete</button>
                  </td>
              </tr>`;
          dataBookElement.innerHTML += row;
        }
      });
    }
  }

  function deleteBook(id) {
    const dbRef = ref(database, `book/${id}`);
    remove(dbRef)
      .then(() => {
        alert('Book berhasil dihapus!');
        readBooks(); // Call readBooks to refresh the data
      })
      .catch((error) => {
        console.error('Gagal menghapus Book: ', error);
      });
  }

  // Assign deleteBook to window for global access
  window.deleteBook = deleteBook;

  readBooks();
});
