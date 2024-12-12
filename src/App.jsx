import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState({
    Aventuras: [],
    'Ciencia Ficción': [],
    Histórica: [],
    'Novela Negra': [],
    Romántica: [],
    Terror: [],
    Tecnología: [],
  });
  const [recentBooks, setRecentBooks] = useState([]); // Libros recientes
  const [showCategories, setShowCategories] = useState({});

  // Función para buscar libros
  const bookSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(GOOGLE_BOOKS_API_URL, {
        params: {
          q: searchTerm,
          maxResults: 10,
        },
      });

      const results = response.data.items || [];
      setBooks(results);

      // Guardar el libro en recientes y en localStorage
      const newRecentBooks = [
        { title: searchTerm, timestamp: Date.now() },
        ...recentBooks.slice(0, 4),
      ];
      setRecentBooks(newRecentBooks);
      localStorage.setItem('recentBooks', JSON.stringify(newRecentBooks)); // Guardar en Local Storage
    } catch (error) {
      console.error('Error al buscar libros:', error);
    }
  };

  // Función para guardar un libro en una categoría
  const saveBookToCategory = (book, category) => {
    const updatedCategories = { ...categories };

    if (!updatedCategories[category]) {
      updatedCategories[category] = [];
    }
    updatedCategories[category].push(book);
    setCategories(updatedCategories);

    // Actualizar el estado colapsado para que incluya la nueva categoría
    if (!(category in showCategories)) {
      setShowCategories({ ...showCategories, [category]: false });
    }

    // Guardar en Local Storage
    localStorage.setItem('categories', JSON.stringify(updatedCategories));
  };

  // Cargar las categorías y los libros recientes desde Local Storage al cargar la app
  useEffect(() => {
    const storedCategories = localStorage.getItem('categories');
    const storedRecentBooks = localStorage.getItem('recentBooks');

    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    }

    if (storedRecentBooks) {
      setRecentBooks(JSON.parse(storedRecentBooks));
    }
  }, []);

  return (
    <main className="app-container">
      <header className="app-header">
        <h1>📚 Buscador de Libros 📚</h1>
      </header>
      <section className="content-container">
        <div className="categorias">
          <h2>Categorías</h2>
          {Object.keys(categories).length > 0 ? (
            <div className="categorias-list">
              {Object.keys(categories).map((category) => (
                <li key={category} className="categoria-item">
                  <button
                    onClick={() =>
                      setShowCategories((prev) => ({
                        ...prev,
                        [category]: !prev[category],
                      }))
                    }
                    className="categoria-button"
                  >
                    {category}
                  </button>
                  {showCategories[category] && (
                    <div className="categoria-books">
                      {categories[category].map((book, index) => (
                        <div key={index} className="book-item">
                          <h5>{book.volumeInfo.title}</h5>
                          <p>{book.volumeInfo.authors?.join(', ') || 'Autor desconocido'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </div>
          ) : (
            <p>No hay libros guardados.</p>
          )}
        </div>

        <div className="search-section">
          <form onSubmit={bookSearch} className="search-form">
            <input
              id="search-input"
              type="text"
              placeholder="Título del libro"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button
              type="submit"
              disabled={!searchTerm.trim()}
              className="search-button"
            >
              Buscar
            </button>
          </form>
          <div className="libros-obtenidos">
            {books.length > 0 ? (
              <ul className="books-list">
                {books.map((book) => (
                  <li key={book.id} className="book-result">
                    <h3>{book.volumeInfo.title}</h3>
                    <p>{book.volumeInfo.authors?.join(', ') || 'Autor desconocido'}</p>
                    <select
                      onChange={(e) => saveBookToCategory(book, e.target.value)}
                      defaultValue=""
                      className="category-select"
                    >
                      <option value="" disabled>
                        Selecciona una categoría
                      </option>
                      {Object.keys(categories).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No se han encontrado libros.</p>
            )}
          </div>
        </div>

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
      </section>
    </main>
  );
}

export default App;
