import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectProductRequest } from '../../../../redux/data/dataSlice';
import './CommentCard.scss';

interface BaseCardProps {
  commentId: number,
  data: {
    content: string,
    replyingTo?: string,
    user: {
      image: string,
      name: string,
      username: string
    }
  }
  postCallback: (commentId: number, content: string, replyingTo: string) => Promise<boolean>
}

interface ChildCommentCardProps extends BaseCardProps {
  isLastChild: boolean
}

interface CommentCardProps extends BaseCardProps {
  hasChild: boolean
  isLast: boolean
}

interface CardProps extends BaseCardProps, ChildCommentCardProps, CommentCardProps {
  isChild: boolean
}

const Card = (props: CardProps) => {
  const { commentId, data, isLast, hasChild, isChild, isLastChild } = props;
  const [isCollapsed, setCollapsed] = useState(true)
  const [value, setValue] = useState('')
  const [isEnabled, setEnabled] = useState(true)
  const [isError, setError] = useState(false);
  const productRequestData = useSelector(selectProductRequest);

  useEffect(() => {
    if (!isEnabled) {
      setEnabled(true);
      setValue('');
      setCollapsed(true);
    }
  }, [productRequestData.productRequest]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value;
    if (text.length > 225) {
      setValue(text.substring(0, 225));
    } else {
      setValue(text);
    }
  }

  const handleOnClick = () => {
    const comment = value.trim();
    if (comment !== '') {
      setEnabled(false)
      props.postCallback(commentId, comment, data.user.name);
    } else {
      setError(true);
    }
  }

  return (
    <div className={`comment-card${isCollapsed ? ' collapsed' : ''}${isLast ? ' last' : ''}${isChild ? ' child' : ''}${isLastChild ? ' last-child' : ''}`}>
      <img className='avatar' src={data.user.image} />
      <div className='name-wrap'>
        <div className='name'>{data.user.name}</div>
        <div className='username'>@{data.user.username}</div>
      </div>
      <div className='reply-toggle' onClick={() => setCollapsed(!isCollapsed)}>Reply</div>
      <div className='content'>{data.replyingTo ? <span className='replyTo'>{`@${data.replyingTo}\u00A0\u00A0`}</span> : null}{data.content}</div>
      <textarea className={`reply-box text-area${isError ? ' error' : ''}`}
        value={value}
        onChange={(e) => handleChange(e)}
        onFocus={() => { if (isError) setError(false) }}
        disabled={!isEnabled} />
      <button className='reply-button link-button bt-1' disabled={!isEnabled} onClick={handleOnClick}>{isEnabled ? 'Post Reply' : 'Posting...'}</button>
      {isChild || hasChild ? <hr className='thread-line' /> : null}
    </div>
  )
}

export const CommentCard = (props: CommentCardProps) => {
  return (
    <Card
      commentId={props.commentId}
      data={props.data}
      hasChild={props.hasChild}
      isLast={props.isLast}
      isLastChild={false}
      isChild={false}
      postCallback={props.postCallback}
    />
  )
}

export const ChildCommentCard = (props: ChildCommentCardProps) => {
  return (
    <Card
      commentId={props.commentId}
      data={props.data}
      isLastChild={props.isLastChild}
      isChild={true}
      hasChild={false}
      isLast={false}
      postCallback={props.postCallback}
    />
  )
}


export default CommentCard;