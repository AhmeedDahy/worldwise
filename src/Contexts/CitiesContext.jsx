import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";

const CitiesContext = createContext();

const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: "",
};
function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };
    case "cities/loaded":
      return { ...state, cities: action.payLoad, isLoading: false };
    case "city/loaded":
      return { ...state, currentCity: action.payLoad, isLoading: false };
    case "city/create":
      return {
        ...state,
        isLoading: false,
        cities: [...state.cities, action.payLoad],
        currentCity: action.payLoad,
      };
    case "city/delete":
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payLoad),
        currentCity: {},
      };
    case "rejected":
      return { ...state, isLoading: false, error: action.payLoad };
    default:
      throw new Error("Unkwon action");
  }
}

function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
    reducer,
    initialState
  );

  // const [cities, setCities] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [currentCity, setCurrentCity] = useState({});

  useEffect(function () {
    async function fetchData() {
      dispatch({ type: "loading" });
      try {
        const res = await fetch("http://localhost:9000/cities");
        const data = await res.json();
        dispatch({ type: "cities/loaded", payLoad: data });
      } catch {
        dispatch({ type: "rejected", payLoad: "failed to load cities" });
      }
    }
    fetchData();
  }, []);

  const getCity = useCallback(
    async function getCity(id) {
      if (+id === currentCity.id) return;

      dispatch({ type: "loading" });
      try {
        const res = await fetch(`http://localhost:9000/cities/${id}`);
        const data = await res.json();
        dispatch({ type: "city/loaded", payLoad: data });
      } catch {
        dispatch({ type: "rejected", payLoad: "failed to load city" });
      }
    },
    [currentCity.id]
  );

  async function createCity(newCity) {
    dispatch({ type: "loading" });
    try {
      const res = await fetch(`http://localhost:9000/cities`, {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      dispatch({
        type: "city/create",
        payLoad: data,
      });
    } catch {
      dispatch({ type: "rejected", payLoad: "failed to create city" });
    }
  }

  async function deleteCity(id) {
    dispatch({ type: "loading" });
    try {
      await fetch(`http://localhost:9000/cities/${id}`, {
        method: "DELETE",
      });
      dispatch({
        type: "city/delete",
        payLoad: id,
      });
    } catch {
      dispatch({ type: "rejected", payLoad: "failed to delete city" });
    }
  }
  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        error,
        getCity,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error("CitiesContext was used outside CitiesProvider");
  return context;
}

export { CitiesProvider, useCities };
