import { useState } from 'react';
import './AddComment.scss';

interface AddCommentProps {
  loading: boolean
  postCallback: (content: string) => Promise<boolean>
}

function AddComment(props: AddCommentProps) {
  const [value, setValue] = useState('');
  const [numText, setNumText] = useState(225);
  const [isEnabled, setEnabled] = useState(true);
  const [isError, setError] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    let text = event.target.value;
    if (text.length > 225) {
      text = text.substring(0, 225);
    }
    setValue(text);
    setNumText(225 - text.length);
  }

  const handleOnClick = () => {
    const comment = value.trim();

    if (comment !== '') {
      setEnabled(false)
      props.postCallback(comment).then((res) => {
        setEnabled(res)
        setValue('')
        setNumText(225);
      });
    } else {
      setError(true);
    }
  }
  //{errorTextInput[0] ? <div className='error-text'>Can't be empty</div> : null}
  return (
    <div className={`add-comment suggest-card${props.loading ? ' loading' : ''}`}>
      <div className='title'>Add Comment</div>
      <textarea className={`reply-box text-area${isError ? ' error' : ''}`}
        placeholder='Type your comment here'
        value={value}
        onChange={(e) => handleChange(e)}
        disabled={props.loading || !isEnabled}
        onFocus={() => { if (isError) setError(false) }} />
      <div className='control-wrap'>
        <div className='char-left'>{`${numText} character${numText === 1 ? '' : 's'} left`}</div>
        <button className='reply-button link-button bt-1' disabled={props.loading || !isEnabled} onClick={handleOnClick}>{isEnabled ? 'Post Comment' : 'Posting...'}</button>
      </div>
    </div>
  )
}

export default AddComment;