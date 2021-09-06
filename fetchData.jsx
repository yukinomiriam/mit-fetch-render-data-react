
const Pagination = ({ items, pageSize, onPageChange }) => {
  const { Button } = ReactBootstrap;
  if (items.length <= 1) return null;

  let num = Math.ceil(items.length / pageSize);
  let pages = range(1, num + 1);
  const list = pages.map(page => {
    return (
      <Button key={page} onClick={onPageChange} className="btn-nav">
        {page} 
      </Button>
    );
  });
  return (
    <nav>
      <ul className="nav justify-content-center">{list}</ul>
    </nav>
  );
};
const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};
function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
}
const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData
  });

  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    default:
      throw new Error();
  }
};
// App that gets data from Hacker News url
function App() {
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("Omaha");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [errors,setErrors]=useState({searchError:''});
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "https://app.ticketmaster.com/discovery/v2/events.json?countryCode=US&apikey=Usat0Pz5hVawjYLmfG3tWX7AIT3AEqPN&city=Omaha",
    {
      _embedded: {
      
          events: []
      }
      
    }
  );
  const handlePageChange = e => {
    setCurrentPage(Number(e.target.textContent));
  };
  
  console.log("page:"+JSON.stringify(data.page));
  console.log(data._embedded != "undefined");
  if (typeof (data.page) != "undefined" && data.page.totalElements == 0){
    console.log(data.page.totalElements);
    setErrors({...errors, searchError : 'No records found.'});
  }
  let arr = data._embedded;
  let page = [];
  //console.log("Arr: " +JSON.stringify(arr));
  if(typeof(arr) != "undefined"){
    page = arr.events;
    if (page.length >= 1) {
      page = paginate(page, currentPage, pageSize);
    }
  }
  if(typeof(arr) === "undefined"){
    return(
      <div style={{color:'red'}}>{errors.searchError}</div>
    );
  }
  
  return (
    <Fragment>
      <div className="row ticketmaster-header">
        <div className="col-6">
            <img src="https://media.ticketmaster.eu/spain/feature/guia-estilo/assets/ticketmaster/ticketmaster-logo_white.png" width="250px"/>
        </div>
        <div className="col-md-auto">
      <form
        onSubmit={event => {
         // console.log(`Query: ${query}`);
          let url = `https://app.ticketmaster.com/discovery/v2/events.json?countryCode=US&apikey=Usat0Pz5hVawjYLmfG3tWX7AIT3AEqPN&city=${query}`;
          //console.log(`url: ${url}`);
          doFetch(url);
          event.preventDefault();
        }}
      >
          <input className="inputQuery"
            type="text"
            value={query}
            onChange={event => setQuery(event.target.value)}
          />
          <button type="submit" className="searchButton">Search</button>
          </form>
        </div>
      </div>
      {isError && <div>Something went wrong ...</div>}
      

      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <div className="row list-container">
        <div className="col">  
        <ul className="list-group">
          {page.map(item => (
            
            <li key={item.id} className="list-group-item"> 
            <a href={item.url} target="_blank" className="item-color">
              <div className="d-flex w-100 justify-content-lg-start">
                <h5>
                    {item.name} -
                </h5>
                <p className="event-date-container">
                {new Intl.DateTimeFormat("en-US", {
                     weekday: 'long',
                      year: "numeric",
                      month: "long",
                      day: "2-digit",
                      hour: 'numeric',
                      minute: 'numeric'
                       }).format(new Date(item.dates.start.dateTime))}
                </p>
              </div>

              <small>   
                   {item._embedded.venues[0].name} 
              </small> 
            </a>  
            </li>
          ))}
        </ul>
        </div>
        </div> 
      )}
      <div className="row list-container-bottom">
        <div className="col">  
          <Pagination
            items={arr.events}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          ></Pagination>
      </div>
    </div>
    </Fragment>
  );
}

// ========================================
ReactDOM.render(<App />, document.getElementById("root"));
