import './FeedbackBoard.scss';
import IconBurger from '../../../../assets/shared/mobile/icon-hamburger.svg';
import IconClose from '../../../../assets/shared/mobile/icon-close.svg';
import { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { feedbackCategory, FeedbackCategory } from '../../../../data/database';
import { fetchRoadmapCount, selectRoadmapCount, setCategoryFilters } from '../../../../redux/data/dataSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { rootURL } from '../../../../components/App/App';

interface FeedbackBoardProps {
  categories: FeedbackCategory[],
  loading: boolean
}

function FeedbackBoard(props: FeedbackBoardProps) {
  const roadmapCountData = useSelector(selectRoadmapCount);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchRoadmapCount())
  }, [])

  const [categories, setCategories] = useState<FeedbackCategory[]>(props.categories);

  useEffect(() => {
    setCategories(props.categories)
  }, [props.categories])

  const handleSetCategory = (category?: FeedbackCategory) => {
    if (props.loading)
      return;
      
    const newCategories: FeedbackCategory[] = [];

    if (!category) { } //Empty array for 'All' condition
    else {
      categories.forEach((selectedCategory) => {
        if (selectedCategory !== category) {
          newCategories.push(selectedCategory)
        }
      })

      if (newCategories.length === categories.length) {
        newCategories.push(category)
      }
    }
    dispatch(setCategoryFilters(newCategories))
  }

  const [sidebarActive, setSidebarActive] = useState(false);
  const onSetSidebarActive = (isActive: boolean, noScroll = true) => {
    if (isActive && noScroll) {
      window.scrollTo(0, 0);
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    setSidebarActive(isActive);
  }

  const onToggleClick = () => {
    if (isMobileLayout) {
      onSetSidebarActive(!sidebarActive)
    } else {
      onSetSidebarActive(!sidebarActive, false)
    }
  }

  const isTabletLayout = useMediaQuery({ maxWidth: 700 }, undefined, () => onSetSidebarActive(false));
  const isMobileLayout = useMediaQuery({ maxWidth: 375 }, undefined, () => onSetSidebarActive(false));

  return (
    <div className='feedback-board'>
      <div className='f-header'>
        <div className='wrap'>
          <div className='title'>Frontend Mentor</div>
          <div className='sub'>Feedback Board</div>
          <img className="toggle" src={sidebarActive ? IconClose : IconBurger} onClick={() => onToggleClick()} />
        </div>
      </div>
      <div className={`nav-wrap${sidebarActive ? ' active' : ''}`}>
        <div className='outer-wrap'>
          <div className='f-categories'>
            <div className='wrap'>
              <div className={`category${categories.length === 0 ? ' active' : ''}${props.loading ? ' loading' : ''}`} onClick={() => handleSetCategory()}>All</div>
              {
                feedbackCategory.map((category, index) => {
                  return (
                    <div key={index}
                      className={`category${categories.includes(category) ? ' active' : ''}${props.loading ? ' loading' : ''}`}
                      onClick={() => handleSetCategory(category)}>
                      {category.length < 3 ? category.toUpperCase() : category}
                    </div>
                  )
                })
              }
            </div>
          </div>
          <div className='f-status'>
            <div className='wrap'>
              <div className='title-wrap'>
                <span className='title'>Roadmap</span>
                <Link to={`${rootURL}/roadmap`} onClick={() => document.body.classList.remove('no-scroll')} state={{ from: [rootURL + '/'] }}>View</Link>
              </div>
              <ul className={roadmapCountData.roadmapCountStatus !== 'ready' ? 'loading' : ''}>
                <li><span className='dot plan' /> Planned <span className='quantity'>{roadmapCountData.roadmapCount.planned}</span></li>
                <li><span className='dot progress' /> In-Progress <span className='quantity'>{roadmapCountData.roadmapCount.inProgress}</span></li>
                <li><span className='dot live' /> Live <span className='quantity'>{roadmapCountData.roadmapCount.live}</span></li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default FeedbackBoard;
