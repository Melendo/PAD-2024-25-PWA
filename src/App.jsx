import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

function App() {
  const [promptBusqueda, setPromptBusqueda] = useState('');
  const [busquedasRecientes, setBusquedasRecientes] = useState([]);

  const [libros, setLibros] = useState([]);
  const [libroSeleccionado, setLibroSeleccionado] = useState(null);

  const [categorias, setCategorias] = useState(initialCategories);
  const [mostrarcategorias, setMostrarCategorias] = useState({});
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');

  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  const loadFromLocalStorage = () => {
    const categoriasGuardadas = localStorage.getItem('categorias');
    const busquedasRecientesGuardadas = localStorage.getItem('busquedasRecientes');

    if (categoriasGuardadas) setCategorias(JSON.parse(categoriasGuardadas));
    if (busquedasRecientesGuardadas) setBusquedasRecientes(JSON.parse(busquedasRecientesGuardadas));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(GOOGLE_BOOKS_API_URL, {
        params: { q: promptBusqueda, maxResults: 5, printType: "BOOKS" },
      });
      const resultadoPeticion = response.data.items || [];
      setLibros(resultadoPeticion);
      updateBusquedasRecientes(promptBusqueda);
    } catch (error) {
      console.error('Error al buscar libros:', error);
    }
  };

  const updateBusquedasRecientes = (promt) => {
    const updatedBusquedasRecientes = [
      { titulo: promt, fecha: Date.now() },
      ...busquedasRecientes.slice(0, 4),
    ];
    setBusquedasRecientes(updatedBusquedasRecientes);
    localStorage.setItem('busquedasRecientes', JSON.stringify(updatedBusquedasRecientes));
  };

  const handleCategoryAction = (action, book, category) => {
    const updatedCategories = { ...categorias };

    if (action === 'add') {
      updatedCategories[category] = [...(updatedCategories[category] || []), book];
    } else if (action === 'delete') {
      updatedCategories[category] = updatedCategories[category]?.filter((b) => b.id !== book.id);
    }

    setCategorias(updatedCategories);
    localStorage.setItem('categories', JSON.stringify(updatedCategories));
  };

  const toggleCategoryVisibility = (category) => {
    setMostrarCategorias((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const handleSaveToCategory = (book) => {
    if (!categoriaSeleccionada) {
      alert('Por favor, selecciona una categoría antes de guardar.');
      return;
    }
    handleCategoryAction('add', book, categoriaSeleccionada);
  };

  const renderCategoryList = () => (
    <div className="categorias">
      <h2>Categorías</h2>
      {Object.keys(categorias).length > 0 ? (
        <ul className="categorias-list">
          {Object.keys(categorias).map((category) => (
            <li key={category} className="categoria-item">
              <button
                onClick={() => toggleCategoryVisibility(category)}
                className="categoria-button"
              >
                🔽 ({categorias[category]?.length || 0}) {category}
              </button>
              {mostrarcategorias[category] && renderBooksInCategory(category)}
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
      {categorias[category]?.length > 0 ? (
        categorias[category].map((book, index) => (
          <BookItem
            key={index}
            book={book}
            onBookClick={() => setLibroSeleccionado(book)}
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
      {busquedasRecientes.length > 0 ? (
        <div className="categoria-books">
          {busquedasRecientes.map((book, index) => (
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
              value={promptBusqueda}
              onChange={(e) => setPromptBusqueda(e.target.value)}
              className="search-input"
            />
            <button type="submit" disabled={!promptBusqueda.trim()} className="search-button">
              Buscar
            </button>
          </form>
          <select
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            className="category-select"
          >
            <option value="">Seleccionar categoría</option>
            {Object.keys(categorias).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {libros.length > 0 ? (
            <ul className="books-list">
              {libros.map((book) => (
                <BookItem
                  key={book.id}
                  book={book}
                  onBookClick={() => setLibroSeleccionado(book)}
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
      {libroSeleccionado && <BookDetailsModal book={libroSeleccionado} onClose={() => setLibroSeleccionado(null)} />}
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
