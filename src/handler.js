const { nanoid } = require('nanoid');
const books = require('./books');
//
// Kriteria 1 : API dapat menyimpan buku
//
const addBookHandler = (request, h) => {
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;
  const id = nanoid(16);
  const finishedObserver = (pageCounter, readPager) => {
    if (pageCounter === readPager) {
      return true;
    }
    return false;
  };
  const finished = finishedObserver(pageCount, readPage);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;
  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
    finished,
    insertedAt,
    updatedAt,
  };

  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }
  books.push(newBook);
  const isSuccess = books.filter((book) => book.id === id).length > 0;
  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }
  const response = h.response({
    status: 'error',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};
//
// Kriteria 2 : API dapat menampilkan seluruh buku
//
const getAllBooks = (request, h) => {
  const { name, reading, finished } = request.query;
  // name request query parameter
  if (name !== undefined) {
    const book = books.filter((n) => n.name.toLowerCase().includes(name.toLowerCase()));
    const response = h.response({
      status: 'success',
      data: {
        books: book.map((n) => ({
          id: n.id,
          name: n.name,
          publisher: n.publisher,
        })),
      },
    });
    response.code(200);
    return response;
  }
  // reading reqeust query parameter
  if (reading !== undefined) {
    if (reading === 0) {
      const read = books.filter((n) => n.reading === false);
      const response = h.response({
        status: 'success',
        data: {
          books: read.map((n) => ({
            id: n.id,
            name: n.name,
            publisher: n.publisher,
          })),
        },
      });
      response.code(200);
      return response;
    }
    const read = books.filter((n) => n.reading === true);
    const response = h.response({
      status: 'success',
      data: {
        books: read.map((n) => ({
          id: n.id,
          name: n.name,
          publisher: n.publisher,
        })),
      },
    });
    response.code(200);
    return response;
  }
  // request Query parameter finished
  if (finished !== undefined) {
    console.log(typeof finished);
    if (finished === '0') {
      // console.log(books);
      const finish = books.filter((n) => n.finished === false);
      const response = h.response({
        status: 'success',
        data: {
          books: finish.map((n) => ({
            id: n.id,
            name: n.name,
            publisher: n.publisher,
          })),
        },
      });
      response.code(200);
      return response;
    }
    const finish = books.filter((n) => n.finished === true);
    // console.log(finish);
    const response = h.response({
      status: 'success',
      data: {
        books: finish.map((n) => ({
          id: n.id,
          name: n.name,
          publisher: n.publisher,
        })),
      },
    });
    response.code(200);
    return response;
  }
  // get all books
  const book = books.map((items) => ({
    id: items.id,
    name: items.name,
    publisher: items.publisher,
  }));
  const response = h.response({
    status: 'success',
    data: {
      books: book,
    },
  });
  response.code(200);
  return response;
};
//
// Kriteria 3 : API dapat menampilkan detail buku
//
const getDetailBooks = (request, h) => {
  const { bookId } = request.params;
  const book = books.filter((n) => n.id === bookId)[0];
  if (book !== undefined) {
    const response = h.response({
      status: 'success',
      data: {
        book,
      },
    });
    response.code(200);
    return response;
  }
  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};
//
// Kriteria 4 : API dapat mengubah data buku
//
const editBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  if (name === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }
  const updatedAt = new Date().toISOString();
  const index = books.findIndex((item) => item.id === bookId);
  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt,
    };
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  }
  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};
//
// Kriteria 5 : API dapat menghapus buku
//
const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const index = books.findIndex((n) => n.id === bookId);
  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }
  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooks,
  getDetailBooks,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
