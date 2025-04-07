import { useEffect, useState } from "react";
import Search from "./components/Search.jsx";
import Spinner from "./components/spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import { useDebounce } from "react-use";
import { updateSearchCount } from "./appwrite.js";

const API_BASE_URL = "https://api.themoviedb.org/3";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [SearchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState(" ");
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [DebouncedSearchTerm, setDebouncedSearchTerm] = useState(" ");
  //used to debounce
  useDebounce(() => setDebouncedSearchTerm(SearchTerm), 500, [SearchTerm]);

  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const data = await response.json();

      if (data.Response === "False") {
        setErrorMessage(data.Error || "Failed to fetch moviess");
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);


      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies:${error}`);
      setErrorMessage("Error fetching movies. Please try again later");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(DebouncedSearchTerm);
  }, [DebouncedSearchTerm]);
  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />

          <h1>
            {" "}
            Find <span className="text-gradient">Movies</span> you'll Enjoy
            without any hassle
          </h1>
          <Search SearchTerm={SearchTerm} setSearchTerm={setSearchTerm} />
        </header>
        <spinner />
        <section className="all-movies">
          <h2 className="mt-[40PX]"> All Movies</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
