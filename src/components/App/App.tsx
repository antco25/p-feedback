import './App.scss';
import { Route, Routes, Navigate } from 'react-router-dom';
import { FeedbackPageEdit, FeedbackPageNew } from '../../pages/FeedbackPage/FeedbackPage';
import SuggestionPage from '../../pages/SuggestionPage/SuggestionPage';
import FeedbackDetailPage from '../../pages/FeedbackDetailPage/FeedbackDetailPage';
import RoadmapPage from '../../pages/RoadmapPage/RoadmapPage';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser, selectCurrentUser } from '../../redux/data/dataSlice';

export const rootURL = '/p-feedback';

function App() {
  const currentUser = useSelector(selectCurrentUser)
  const dispatch = useDispatch();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (currentUser.currentUserStatus === 'loading') {
      dispatch(fetchCurrentUser());
    }
    else if (currentUser.currentUserStatus === 'ready') {
      setStatus('ready')
    }
  }, [dispatch, currentUser.currentUserStatus])

  if (status !== 'ready') {
    return <div className="App">Loading...</div>
  }

  return (
    <div className="App">
      <Routes>
        <Route path={`${rootURL}/home`} element={<SuggestionPage />} />
        <Route path={`${rootURL}/new`} element={<FeedbackPageNew />} />
        <Route path={`${rootURL}/edit/:id`} element={<FeedbackPageEdit />} />
        <Route path={`${rootURL}/detail/:id`} element={<FeedbackDetailPage />} />
        <Route path={`${rootURL}/roadmap`} element={<RoadmapPage />} />
        <Route path='*' element={<Navigate to={`${rootURL}/home`} />} />
      </Routes>
    </div>
  );
}

export interface LocationState {
  from: string[]
}

export default App;
