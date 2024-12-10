import { useState, useEffect } from 'react'
import axios from "axios"
import './App.css'

const GOOGLE_BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes"

function App() {
  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState({
    "Aventuras": [],
    "Ciencia Ficción": [],
    "Histórica": [],
    "Novela Negra": [],
    "Romántica": [],
    "Terror": [],
    "Tecnología": [],
  });

  const [recentBooks, setRecentBooks] = useState([]);

  // Funcion para buscar libros
  const bookSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(GOOGLE_BOOKS_API_URL, {
        params: {
          q: searchTerm,
          maxResult: 10,
        },
      });

      const results = response.data.items || [];
      setBooks(results);

      //Actualizar libros recientes
      const newRecentBooks = [
        { title: searchTerm, timestamp: Date.now()},
        ...recentBooks.slice(0, 4),
      ];
      setRecentBooks(newRecentBooks);
    } catch (error) {
      console.error("Error al buscar libros:", error)
    }
  };
}

export default App
