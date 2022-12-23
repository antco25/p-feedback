import './SuggestCard.scss';
import EmptyImage from '../../assets/suggestions/illustration-empty.svg';
import { ReactComponent as IconUpArrow } from '../../assets/shared/icon-arrow-up.svg';
import { FeedbackCategory } from '../../data/database';
import { Link } from 'react-router-dom';
import React from 'react';
import { rootURL } from '../App/App';

export interface SuggestCardProps {
  id: number,
  title: string,
  desc: string,
  upvotes: number,
  category: FeedbackCategory,
  commentsLength: number,
  isUpvoted: boolean,
  className?: string,
  upvoteCallback: (productRequestId: number) => void
}

function SuggestCard(props: SuggestCardProps) {
  const onUpvote = (e: React.MouseEvent<HTMLElement>, productRequestId: number) => {
    props.upvoteCallback(productRequestId);
    e.preventDefault();
  }

  const category = (props.category === 'ui' || props.category === 'ux') ? props.category.toUpperCase() : props.category; 

  return (
    <div className={`suggest-card suggestion${props.className ? ' ' + props.className : ''}`}>
      <div className='title'>{props.title}</div>
      <div className='desc'>{props.desc}</div>
      <div className={`upvotes${props.isUpvoted ? ' active' : ''}`} onClick={(e) => onUpvote(e, props.id)}><IconUpArrow />{props.upvotes}</div>
      <div className='category'>{category}</div>
      <div className='comments-num'><span>{props.commentsLength}</span></div>
    </div>
  );
}

export interface SuggestCardLoadingProps {
  cardCount?: number
}

export function SuggestCardLoading(props: SuggestCardLoadingProps) {
  const card = (key: string) => <SuggestCard
    key={key}
    id={0}
    title='.'
    desc='.'
    upvotes={0}
    category='feature'
    commentsLength={0}
    isUpvoted={false}
    className='loading'
    upvoteCallback={()=> {}}
  />

  const cards = Array(props.cardCount ? props.cardCount : 3).fill(card);

  return (
    <React.Fragment>
      {cards.map((c, index) => c(index))}
    </React.Fragment>
  )
}

export function SuggestCardEmpty() {
  return (
    <div className='suggest-card empty'>
      <img src={EmptyImage} alt='empty'/>
      <div className='title'>There is no feedback yet.</div>
      <div className='desc'>Got a suggestion? Found a bug that needs to be squashed? We love hearing about new ideas to improve our app.</div>
      <Link to={`${rootURL}/new`} className='suggest-add link-button bt-1' state={{ from: [rootURL +'/'] }}>+ Add Feedback</Link>
    </div>
  )
}

export default SuggestCard;
