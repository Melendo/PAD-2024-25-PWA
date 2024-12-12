import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

function App() {
  // Estados
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

  const [recentBooks, setRecentBooks] = useState([]);
  const [showCategories, setShowCategories] = useState({});

  // Funcion para buscar libros
  const bookSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(GOOGLE_BOOKS_API_URL, {
        params: {
          q: searchTerm,
          maxResults: 5,
        },
      });

      const results = response.data.items || [];
      setBooks(results);

      const newRecentBooks = [
        { title: searchTerm, timestamp: Date.now() },
        ...recentBooks.slice(0, 4),
      ];
      setRecentBooks(newRecentBooks);
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

    // Guardar en localStorage
    localStorage.setItem('categories', JSON.stringify(updatedCategories));
  };

  // Cargar las categorías desde localStorage al cargar la app
  useEffect(() => {
    const storedCategories = localStorage.getItem('categories');
    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    }
  }, []);

  // Interfaz HTML
  return (
    <main style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9f9f9', padding: '20px', width: '1200px', margin: '1' }}>
      {/* Cabecera de la pagina */}
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#333', fontSize: '2rem' }}>📚 Buscador de Libros 📚</h1>
      </header>
      <section style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {/* Libros por Categorías */}
        <div
          className="categorias"
          style={{
            flex: '1',
            padding: '10px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            minWidth: '250px',
          }}
        >
          <h2 style={{ borderBottom: '2px solid #ddd', paddingBottom: '5px', margin: '10px' }}>Categorías</h2>
          {Object.keys(categories).length > 0 ? (
            <ul style={{ listStyleType: 'none', padding: '0' }}>
              {Object.keys(categories).map((category) => (
                <li key={category} style={{ marginBottom: '10px' }}>
                  <button
                    onClick={() =>
                      setShowCategories((prev) => ({
                        ...prev,
                        [category]: !prev[category],
                      }))
                    }
                    style={{
                      width: '100%',
                      background: '#007bff',
                      color: '#fff',
                      padding: '10px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {category}
                  </button>
                  {showCategories[category] && (
                    <ul style={{ marginLeft: '10px', marginTop: '10px', listStyleType: 'circle' }}>
                      {categories[category].map((book, index) => (
                        <li key={index} style={{ marginBottom: '8px' }}>
                          <h5 style={{ margin: '0', fontSize: '1rem' }}>{book.volumeInfo.title}</h5>
                          <p style={{ margin: '0', fontSize: '0.9rem', color: '#555' }}>
                            {book.volumeInfo.authors?.join(', ') || 'Autor desconocido'}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay libros guardados.</p>
          )}
        </div>

        <div
          style={{
            flex: '3',
            padding: '10px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            minWidth: '300px',
          }}
        >
          {/* Formulario de busqueda */}
          <form onSubmit={bookSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <input
              id="search-input"
              type="text"
              placeholder="Título del libro"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: '1', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '200px' }}
            />
            <button
              type="submit"
              disabled={!searchTerm.trim()}
              style={{
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Buscar
            </button>
          </form>
          {/* Resultados de libros obtenidos */}
          <div className="libros-obtenidos">
            {books.length > 0 ? (
              <ul style={{ listStyleType: 'none', padding: '0' }}>
                {books.map((book) => (
                  <li
                    key={book.id}
                    style={{
                      padding: '10px',
                      marginBottom: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <h3 style={{ margin: '0', fontSize: '1.2rem' }}>{book.volumeInfo.title}</h3>
                    <p style={{ margin: '0', fontSize: '0.9rem', color: '#555' }}>
                      {book.volumeInfo.authors?.join(', ') || 'Autor desconocido'}
                    </p>
                    <select
                      onChange={(e) => saveBookToCategory(book, e.target.value)}
                      defaultValue=""
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '200px' }}
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
      </section>
    </main>
  );
}

export default App;
