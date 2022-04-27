import './StatusCard.scss';
import { ReactComponent as IconUpArrow } from '../../../../assets/shared/icon-arrow-up.svg';
import { SuggestCardProps } from '../../../../components/SuggestCard/SuggestCard';

export interface StatusCardProps extends SuggestCardProps {
  status: string,
  upvoteCallback: (productRequestId: number) => void
}

function StatusCard(props: StatusCardProps) {
  const onUpvote = (e: React.MouseEvent<HTMLElement>, productRequestId: number) => {
    props.upvoteCallback(productRequestId);
    e.preventDefault();
  }

  const category = (props.category === 'ui' || props.category === 'ux') ? props.category.toUpperCase() : props.category; 

  return (
    <div className={`status-card${' ' + props.status + (props.className ? ' ' + props.className : '')}`}>
      <div className='content-wrap'>
        <div className='status'><span className="dot" />{props.status}</div>
        <div className='title'>{props.title}</div>
        <div className='description'>{props.desc}</div>
        <div className='category'>{category}</div>
        <div className='comment-wrap'>
          <div className={`upvotes${props.isUpvoted ? ' active' : ''}`} onClick={(e) => onUpvote(e, props.id)}><IconUpArrow />{props.upvotes}</div>
          <div className='comments-num'><span>{props.commentsLength}</span></div>
        </div>
      </div>
    </div>
  );
}

export function StatusCardLoading() {
  return (
    <div className={`status-card loading`}>
      <div className='content-wrap'>
        <div className='status'><span className="dot" />.</div>
        <div className='title'>.</div>
        <div className='description'>.</div>
        <div className='category'>.</div>
        <div className='comment-wrap'>
          <div className='upvotes'><IconUpArrow />.</div>
          <div className='comments-num'><span>.</span></div>
        </div>
      </div>
    </div>
  );
}

export default StatusCard;
