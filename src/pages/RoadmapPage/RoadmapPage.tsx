import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { LocationState, rootURL } from '../../components/App/App';
import TransitionPage from '../../components/App/TransitionPage/TransitionPage';
import { ProductRequest, RoadmapType } from '../../data/database';
import { fetchRoadmap, selectCurrentUser, selectRoadmap, setCurrentUser, setRoadmap, setUpvote } from '../../redux/data/dataSlice';
import StatusCard, { StatusCardLoading } from './components/StatusCard/StatusCard';
import './RoadmapPage.scss';

function RoadmapPage() {
  const [statusNav, setStatusNav] = useState('planned');
  const { roadmap, roadmapStatus } = useSelector(selectRoadmap);
  const { currentUser } = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const location = useLocation();;
  const history = (location.state as LocationState) ? (location.state as LocationState).from : [rootURL + '/'];
  const returnURL = history[history.length - 1];
  const returnURLState = history.length > 1 ? history.slice(0, history.length - 1) : history;
  const forwardURLState = [...history, location.pathname];

  useEffect(() => {
    dispatch(fetchRoadmap());
  }, [dispatch])

  const handleSetStatusNav = (status: string) => {
    if (roadmapStatus !== 'ready') return
    setStatusNav(status);
  }

  const upvoteCallback = async (productRequestId: number) => {
    const response = await setUpvote(productRequestId);
    const updatedRoadmap = {} as RoadmapType;

    if (response.productRequest.status === 'planned') {
      updatedRoadmap.planned = updateRoadmapStatus(productRequestId, response.productRequest, roadmap.planned)
      updatedRoadmap.inProgress = roadmap.inProgress;
      updatedRoadmap.live = roadmap.live;
    } else if (response.productRequest.status === 'in-progress') {
      updatedRoadmap.planned = roadmap.planned
      updatedRoadmap.inProgress = updateRoadmapStatus(productRequestId, response.productRequest, roadmap.inProgress)
      updatedRoadmap.live = roadmap.live;
    } else if (response.productRequest.status === 'live') {
      updatedRoadmap.planned = roadmap.planned
      updatedRoadmap.inProgress = roadmap.inProgress;
      updatedRoadmap.live = updateRoadmapStatus(productRequestId, response.productRequest, roadmap.live)
    } else return;

    dispatch(setRoadmap(updatedRoadmap));
    dispatch(setCurrentUser(response.currentUser))

    function updateRoadmapStatus(productRequestId: number, productRequest: ProductRequest, roadmapStatus: ProductRequest[]) {
      return roadmapStatus.map((r) => {
        if (r.id === productRequestId)
          return productRequest;
        else
          return r;
      })
    }
  }

  return (
    <TransitionPage>
      <div className='roadmap-page'>
        <div className='header'>
          <div className='title-wrap'>
            <Link className='return-link' to={returnURL} state={{ from: returnURLState }}>Go Back</Link>
            <div className='title'>Roadmap</div>
          </div>
          <Link to={`${rootURL}/new`} state={{ from: forwardURLState }} className='suggest-add link-button bt-1'>+ Add Feedback</Link>
        </div>
        <div className={`status-nav${roadmapStatus !== 'ready' ? ' loading' : ''}`}>
          <ul>
            <li className={`planned${statusNav === 'planned' ? ' active' : ''}`} onClick={() => handleSetStatusNav('planned')}>
              <span>Planned ({roadmap.planned ? roadmap.planned.length : 0})</span>
            </li>
            <li className={`in-progress${statusNav === 'in-progress' ? ' active' : ''}`} onClick={() => handleSetStatusNav('in-progress')}>
              <span>In-Progress ({roadmap.inProgress ? roadmap.inProgress.length : 0})</span>
            </li>
            <li className={`live${statusNav === 'live' ? ' active' : ''}`} onClick={() => handleSetStatusNav('live')}>
              <span>Live ({roadmap.live ? roadmap.live.length : 0})</span>
            </li>
          </ul>
        </div>
        <div className={`road-map${roadmapStatus !== 'ready' ? ' loading' : ''}`}>
          <div className={`status-col${statusNav === 'planned' ? ' active' : ''}`}>
            <div className='title-wrap'>
              <div className='title'>Planned ({roadmap.planned ? roadmap.planned.length : 0})</div>
              <div className='sub'>Ideas prioritized for research</div>
            </div>
            <div className='status-content'>
              {
                roadmapStatus !== 'ready' ? <StatusCardLoading key={0} /> :
                  roadmap.planned.map((req) => {
                    return <Link to={`${rootURL}/detail/${req.id}`} state={{ from: forwardURLState }} key={req.id}>
                      <StatusCard
                        id={req.id}
                        title={req.title}
                        desc={req.description}
                        upvotes={req.upvotes}
                        category={req.category}
                        commentsLength={req.commentsLength}
                        status={req.status}
                        isUpvoted={currentUser.upvoted.includes(req.id)}
                        upvoteCallback={upvoteCallback} />
                    </Link>
                  })
              }
            </div>
          </div>
          <div className={`status-col${statusNav === 'in-progress' ? ' active' : ''}`}>
            <div className='title-wrap'>
              <div className='title'>In-Progress ({roadmap.inProgress ? roadmap.inProgress.length : 0})</div>
              <div className='sub'>Currently being developed</div>
            </div>
            <div className='status-content'>
              {
                roadmapStatus !== 'ready' ? <StatusCardLoading key={0} /> :
                  roadmap.inProgress.map((req) => {
                    return <Link to={`${rootURL}/detail/${req.id}`} state={{ from: forwardURLState }} key={req.id}>
                      <StatusCard
                        id={req.id}
                        title={req.title}
                        desc={req.description}
                        upvotes={req.upvotes}
                        category={req.category}
                        commentsLength={req.commentsLength}
                        status={req.status}
                        isUpvoted={currentUser.upvoted.includes(req.id)}
                        upvoteCallback={upvoteCallback} />
                    </Link>
                  })
              }
            </div>
          </div>
          <div className={`status-col${statusNav === 'live' ? ' active' : ''}`}>
            <div className='title-wrap'>
              <div className='title'>Live ({roadmap.live ? roadmap.live.length : 0})</div>
              <div className='sub'>Released features</div>
            </div>
            <div className='status-content'>
              {
                roadmapStatus !== 'ready' ? <StatusCardLoading key={0} /> :
                  roadmap.live.map((req) => {
                    return <Link to={`${rootURL}/detail/${req.id}`} state={{ from: forwardURLState }} key={req.id}>
                      <StatusCard
                        id={req.id}
                        title={req.title}
                        desc={req.description}
                        upvotes={req.upvotes}
                        category={req.category}
                        commentsLength={req.commentsLength}
                        status={req.status}
                        isUpvoted={currentUser.upvoted.includes(req.id)}
                        upvoteCallback={upvoteCallback} />
                    </Link>
                  })
              }
            </div>
          </div>
        </div>
      </div>
    </TransitionPage>
  );
}

export default RoadmapPage;