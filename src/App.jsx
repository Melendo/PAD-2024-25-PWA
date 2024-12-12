import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState(initialCategories);
  const [recentBooks, setRecentBooks] = useState([]);
  const [showCategories, setShowCategories] = useState({});
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  const loadFromLocalStorage = () => {
    const storedCategories = localStorage.getItem('categories');
    const storedRecentBooks = localStorage.getItem('recentBooks');

    if (storedCategories) setCategories(JSON.parse(storedCategories));
    if (storedRecentBooks) setRecentBooks(JSON.parse(storedRecentBooks));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(GOOGLE_BOOKS_API_URL, {
        params: { q: searchTerm, maxResults: 5, printType: "BOOKS" },
      });
      const results = response.data.items || [];
      setBooks(results);
      updateRecentBooks(searchTerm);
    } catch (error) {
      console.error('Error al buscar libros:', error);
    }
  };

  const updateRecentBooks = (term) => {
    const updatedRecentBooks = [
      { title: term, timestamp: Date.now() },
      ...recentBooks.slice(0, 4),
    ];
    setRecentBooks(updatedRecentBooks);
    localStorage.setItem('recentBooks', JSON.stringify(updatedRecentBooks));
  };

  const handleCategoryAction = (action, book, category) => {
    const updatedCategories = { ...categories };

    if (action === 'add') {
      updatedCategories[category] = [...(updatedCategories[category] || []), book];
    } else if (action === 'delete') {
      updatedCategories[category] = updatedCategories[category]?.filter((b) => b.id !== book.id);
    }

    setCategories(updatedCategories);
    localStorage.setItem('categories', JSON.stringify(updatedCategories));
  };

  const toggleCategoryVisibility = (category) => {
    setShowCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const handleSaveToCategory = (book) => {
    if (!selectedCategory) {
      alert('Por favor, selecciona una categoría antes de guardar.');
      return;
    }
    handleCategoryAction('add', book, selectedCategory);
  };

  const renderCategoryList = () => (
    <div className="categorias">
      <h2>Categorías</h2>
      {Object.keys(categories).length > 0 ? (
        <ul className="categorias-list">
          {Object.keys(categories).map((category) => (
            <li key={category} className="categoria-item">
              <button
                onClick={() => toggleCategoryVisibility(category)}
                className="categoria-button"
              >
                🔽 ({categories[category]?.length || 0}) {category}
              </button>
              {showCategories[category] && renderBooksInCategory(category)}
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay libros guardados.</p>
      )}
    </div>
  );

  const renderBooksInCategory = (category) => (
    <div className="categoria-books">
      {categories[category]?.length > 0 ? (
        categories[category].map((book, index) => (
          <BookItem
            key={index}
            book={book}
            onBookClick={() => setSelectedBook(book)}
            onDeleteClick={() => handleCategoryAction('delete', book, category)}
          />
        ))
      ) : (
        <p>No hay libros en esta categoría.</p>
      )}
    </div>
  );

  const renderRecentBooks = () => (
    <div className="recent-books">
      <h2>Recientes</h2>
      {recentBooks.length > 0 ? (
        <div className="categoria-books">
          {recentBooks.map((book, index) => (
            <div key={index} className="book-item">
              <h5>{book.title}</h5>
              <p>Fecha: {new Date(book.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No hay libros recientes.</p>
      )}
    </div>
  );

  return (
    <main className="app-container">
      <header className="app-header">
        <h1>📚 Buscador de Libros 📚</h1>
      </header>
      <section className="content-container">
        {renderCategoryList()}
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Título del libro"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" disabled={!searchTerm.trim()} className="search-button">
              Buscar
            </button>
          </form>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="">Seleccionar categoría</option>
            {Object.keys(categories).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {books.length > 0 ? (
            <ul className="books-list">
              {books.map((book) => (
                <BookItem
                  key={book.id}
                  book={book}
                  onBookClick={() => setSelectedBook(book)}
                  onSaveClick={() => handleSaveToCategory(book)}
                />
              ))}
            </ul>
          ) : (
            <p>No se han encontrado libros.</p>
          )}
        </div>
        {renderRecentBooks()}
      </section>
      {selectedBook && <BookDetailsModal book={selectedBook} onClose={() => setSelectedBook(null)} />}
    </main>
  );
}

const BookItem = ({ book, onBookClick, onSaveClick, onDeleteClick }) => (
  <div className="book-item" onClick={onBookClick}>
    <h5>{book.volumeInfo.title}</h5>
    <p>{book.volumeInfo.authors?.join(', ') || 'Autor desconocido'}</p>
    {onSaveClick && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSaveClick();
        }}
        className="save-button"
      >
        Guardar
      </button>
    )}
    {onDeleteClick && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDeleteClick();
        }}
        className="delete-button"
      >
        Eliminar
      </button>
    )}
  </div>
);

const BookDetailsModal = ({ book, onClose }) => (
  <div className="modal">
    <div className="modal-content">
      <button onClick={onClose} className="modal-close">
        ✖
      </button>
      <h2>{book.volumeInfo.title}</h2>
      <p>{book.volumeInfo.authors?.join(', ') || 'Autor desconocido'}</p>
      <img
        src={book.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/150'}
        alt={book.volumeInfo.title}
      />
      <div className="modal-description">
        <p>{book.volumeInfo.description || 'Sin descripción disponible.'}</p>
      </div>
      <p>Publicado en: {book.volumeInfo.publishedDate || 'Desconocida'}</p>
      <a href={book.volumeInfo.infoLink} target="_blank" rel="noopener noreferrer">
        Más información
      </a>
    </div>
  </div>
);

const initialCategories = {
  Aventuras: [],
  'Ciencia Ficción': [],
  Histórica: [],
  'Novela Negra': [],
  Romántica: [],
  Terror: [],
  Tecnología: [],
};

export default App;
