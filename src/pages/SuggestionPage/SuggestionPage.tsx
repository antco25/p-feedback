import './SuggestionPage.scss';
import SuggestBar from './components/SuggestBar/SuggestBar';
import FeedbackBoard from './components/FeedbackBoard/FeedbackBoard';
import SuggestCard, { SuggestCardEmpty, SuggestCardLoading } from '../../components/SuggestCard/SuggestCard';
import { fetchProductRequests, selectProductRequests, setCategoryFilters, setCurrentUser, setProductRequests, setSorting, setUpvote } from '../../redux/data/dataSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Location, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { feedbackCategory, FeedbackCategory, FilterType, sortCategory, SortCategory } from '../../data/database';
import TransitionPage from '../../components/App/TransitionPage/TransitionPage';
import { rootURL } from '../../components/App/App';

function SuggestionPage() {
  const location = useLocation();

  const { currentUser, productRequests, productRequestStatus, sortBy, categoryFilters } = useSelector(selectProductRequests)
  const dispatch = useDispatch();

  const [status, setStatus] = useState('loading');
  const firstRender = useRef(true)

  useEffect(() => {
    let filters = { categories: categoryFilters, sortBy: sortBy };

    //Case: ProductRequests hasn't been requested yet and page is loaded with URL Parameters
    if (productRequestStatus === 'loading' && location.search !== "") {
      filters = getURLFilters(location);
      if (firstRender.current) {
        dispatch(setCategoryFilters(filters.categories));
        dispatch(setSorting(filters.sortBy));
        dispatch(fetchProductRequests(filters))
        firstRender.current = false;
        return;
      } else {
        return;
      }
    }


    if (productRequestStatus !== 'loading') {
      //Case: Append filter parameters to URL filters change or when going back to page
      setURL(filters);
    }

    //Request ProductRequests when page isn't loaded with URL params or when filters change
    dispatch(fetchProductRequests(filters))
    firstRender.current = false;
  }, [categoryFilters, sortBy])

  useEffect(() => {
    setStatus(productRequestStatus);
  }, [productRequestStatus])

  const upvoteCallback = async (productRequestId: number) => {
    const response = await setUpvote(productRequestId);
    const updatedProductRequests = productRequests.map((r) => {
      if (r.id === productRequestId)
        return response.productRequest;
      else
        return r;
    })
    dispatch(setProductRequests(updatedProductRequests));
    dispatch(setCurrentUser(response.currentUser))
  }

  return (
    <TransitionPage>
      <div className="suggestion-page">
        <SuggestBar suggestionsCount={productRequests.length} sort={sortBy} loading={status === 'loading'} />
        <FeedbackBoard categories={categoryFilters} loading={status === 'loading'} />
        <div className='suggest-cards'>
          {
            (status === 'loading') ? <SuggestCardLoading /> :
              productRequests.length === 0 ? <SuggestCardEmpty /> :
                productRequests.map((req) => {
                  return (
                    <Link to={`${rootURL}/detail/${req.id}`} key={req.id} state={{ from: [rootURL + '/'] }}>
                      <SuggestCard
                        id={req.id}
                        title={req.title}
                        desc={req.description}
                        upvotes={req.upvotes}
                        category={req.category}
                        commentsLength={req.commentsLength}
                        isUpvoted={currentUser.upvoted.includes(req.id)}
                        upvoteCallback={upvoteCallback} />
                    </Link>
                  )
                })
          }

        </div>
      </div>
    </TransitionPage>
  );
}

export function parseSortBy(sortByParam: string | null): SortCategory {
  if (!sortByParam)
    return "most-upvotes"

  if (sortCategory.includes(sortByParam as SortCategory)) {
    return sortByParam as SortCategory
  } else {
    return "most-upvotes"
  }
}

export function parseCategories(categoriesParam: string | null): FeedbackCategory[] {
  if (!categoriesParam)
    return []

  const rawCategories = categoriesParam.split('|');
  const categories: FeedbackCategory[] = [];

  rawCategories.forEach((c) => {
    if (feedbackCategory.includes(c as FeedbackCategory)) {
      categories.push(c as FeedbackCategory)
    }
  })

  return categories;
}

function getURLFilters(location: Location): FilterType {
  const urlParams = new URLSearchParams(location.search);
  const sortBy = parseSortBy(urlParams.get('sortBy'));
  const categories = parseCategories(urlParams.get('categories'));

  return {
    categories: categories,
    sortBy: sortBy
  }
}

function setURL(filter: FilterType) {
  let url = '';
  if (filter.categories.length === 0)
    url = rootURL + '/home?' + 'categories=all' + '&sortBy=' + filter.sortBy;
  else
    url = rootURL + '/home?' + 'categories=' + filter.categories.join('|') + '&sortBy=' + filter.sortBy;

  window.history.pushState("", "", url);
}

export default SuggestionPage;