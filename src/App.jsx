import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

function App() {
  const [promptBusqueda, setPromptBusqueda] = useState('');
  const [busquedasRecientes, setBusquedasRecientes] = useState([]);

  const [libros, setLibros] = useState([]);

  const [categorias, setCategorias] = useState(CATEGORIAS);
  const [mostrarcategorias, setMostrarCategorias] = useState({});
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');

  useEffect(() => {
    cargarDatosDeLocalStorage();
  }, []);

  const cargarDatosDeLocalStorage = () => {
    const categoriasGuardadas = localStorage.getItem('categorias');
    const busquedasRecientesGuardadas = localStorage.getItem('busquedasRecientes');

    if (categoriasGuardadas) setCategorias(JSON.parse(categoriasGuardadas));
    if (busquedasRecientesGuardadas) setBusquedasRecientes(JSON.parse(busquedasRecientesGuardadas));
  };

  const ejecutarBusqueda = async (e) => {
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

  const ejecutarAccionDeCategoria = (accion, libro, categoria) => {
    const updatedCategories = { ...categorias };

    if (accion === 'guardar') {
      updatedCategories[categoria] = [...(updatedCategories[categoria] || []), libro];
    } else if (accion === 'eliminar') {
      updatedCategories[categoria] = updatedCategories[categoria]?.filter((b) => b.id !== libro.id);
    }

    setCategorias(updatedCategories);
    localStorage.setItem('categorias', JSON.stringify(updatedCategories));
  };

  const toggleMostrarCategoria = (categoria) => {
    setMostrarCategorias((prev) => ({ ...prev, [categoria]: !prev[categoria] }));
  };

  const guardarEnCategoria = (libro) => {
    if (!categoriaSeleccionada) {
      alert('Por favor, selecciona una categoría antes de guardar.');
      return;
    }
    ejecutarAccionDeCategoria('guardar', libro, categoriaSeleccionada);
  };

  const renderCategorias = () => (
    <div className="categorias">
      <h2>Categorías</h2>
      {Object.keys(categorias).length > 0 ? (
        <ul className="lista-categorias">
          {Object.keys(categorias).map((categoria) => (
            <li key={categoria} className="item-categoria">
              <button
                onClick={() => toggleMostrarCategoria(categoria)}
                className="button-categoria"
              >
                🔽 ({categorias[categoria]?.length || 0}) {categoria}
              </button>
              {mostrarcategorias[categoria] && renderLibrosDeCategoria(categoria)}
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay libros guardados.</p>
      )}
    </div>
  );

  const renderLibrosDeCategoria = (categoria) => (
    <div className="categoria-libros">
      {categorias[categoria]?.length > 0 ? (
        categorias[categoria].map((libro, index) => (
          <ItemLibro
            key={index}
            libro={libro}
            onClickEliminar={() => ejecutarAccionDeCategoria('eliminar', libro, categoria)}
          />
        ))
      ) : (
        <p>No hay libros en esta categoría.</p>
      )}
    </div>
  );

  const renderBusquedasRecientes = () => (
    <div className="busquedas-recientes">
      <h2>Recientes</h2>
      {busquedasRecientes.length > 0 ? (
        <div className="categoria-libros">
          {busquedasRecientes.map((libro, index) => (
            <div key={index} className="item-libro">
              <h5>{libro.titulo}</h5>
              <p>Fecha: {new Date(libro.fecha).toLocaleString()}</p>
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
        {renderCategorias()}

        <div className="section-busqueda">
          <form onSubmit={ejecutarBusqueda} className="form-busqueda">
            <input
              type="text"
              placeholder="Título del libro"
              value={promptBusqueda}
              onChange={(e) => setPromptBusqueda(e.target.value)}
              className="input-busqueda"
            />
            <button type="submit" disabled={!promptBusqueda.trim()} className="button-busqueda">
              Buscar
            </button>
          </form>
          <select
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            className="select-categoria"
          >
            <option value="">Seleccionar categoría</option>
            {Object.keys(categorias).map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
          {libros.length > 0 ? (
            <ul className="lista-libros">
              {libros.map((libro) => (
                <ItemLibro
                  key={libro.id}
                  libro={libro}
                  onClickGuardar={() => guardarEnCategoria(libro)}
                />
              ))}
            </ul>
          ) : (
            <p>No se han encontrado libros.</p>
          )}
        </div>

        {renderBusquedasRecientes()}
      </section>
    </main>
  );
}

const ItemLibro = ({ libro, onClickGuardar, onClickEliminar }) => (
  <div className="item-libro">
    <h5>{libro.volumeInfo.title}</h5>
    <p>{libro.volumeInfo.authors?.join(', ') || 'Autor desconocido'}</p>
    <a href={libro.volumeInfo.infoLink} className='a-libro'>
      Más información
    </a>
    {onClickGuardar && (
      <button
        onClick={() => {
          onClickGuardar();
        }}
        className="save-button"
      >
        Guardar
      </button>
    )}
    {onClickEliminar && (
      <button
        onClick={() => {
          onClickEliminar();
        }}
        className="delete-button"
      >
        Eliminar
      </button>
    )}
  </div>
);

const CATEGORIAS = {
  Aventuras: [],
  'Ciencia Ficción': [],
  Histórica: [],
  'Novela Negra': [],
  Romántica: [],
  Terror: [],
  Tecnología: [],
};

export default App;
