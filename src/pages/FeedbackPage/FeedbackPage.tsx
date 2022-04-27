import './FeedbackPage.scss';
import IconNew from '../../assets/shared/icon-new-feedback.svg';
import IconEdit from '../../assets/shared/icon-edit-feedback.svg';
import { CategoryDropdown, StatusDropdown } from './components/Dropdown/Dropdown';
import { Link, To, useLocation, useNavigate, useParams } from 'react-router-dom';
import { FeedbackCategory, FeedbackStatus } from '../../data/database';
import { useEffect, useState } from 'react';
import TransitionPage from '../../components/App/TransitionPage/TransitionPage';
import { deleteProductRequest, fetchProductRequest, postProductRequest, postProductRequestEdit, selectProductRequest, setCurrentUser } from '../../redux/data/dataSlice';
import { useDispatch, useSelector } from 'react-redux';
import { LocationState, rootURL } from '../../components/App/App';

interface FeedbackPageProps {
  from?: string
}

interface MainFeedbackPageProps {
  from?: string
  isEdit?: boolean
}

export function FeedbackPageNew(props: FeedbackPageProps) {
  return <FeedbackPage from={props.from} isEdit={false} />
}

export function FeedbackPageEdit(props: FeedbackPageProps) {
  return <FeedbackPage from={props.from} isEdit={true} />
}

function FeedbackPage(props: MainFeedbackPageProps) {
  const [errorTextInput, setTextErrorInput] = useState([false, false]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<FeedbackCategory>('ui');
  const [status, setStatus] = useState<FeedbackStatus>('suggestion');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [lock, setLock] = useState(false);

  const { id } = useParams();
  const { isEdit } = props
  const { productRequest, productRequestStatus } = useSelector(selectProductRequest);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const history = (location.state as LocationState) ? (location.state as LocationState).from : [rootURL + '/'];
  const returnURL = history[history.length - 1];
  const returnURLState = history.length > 1 ? history.slice(0, history.length - 1) : history;
  const forwardURLState = [...history, location.pathname];

  useEffect(() => {
    if (!isEdit) {
      return;
    }

    if (productRequestStatus === 'ready' && productRequest.id.toString() === id) {
      return;
    }

    dispatch(fetchProductRequest(id || ''));
    setLoading(true);
    setLock(true);
  }, [])

  useEffect(() => {
    if (!isEdit) {
      return;
    }

    if (productRequestStatus === 'ready') {
      setLoading(false);
      setLock(false);
      setTitle(productRequest.title);
      setCategory(productRequest.category);
      setStatus(productRequest.status);
      setDescription(productRequest.description);
    }

    if (productRequestStatus === 'error') {
      navigate(rootURL);
    }
  }, [productRequestStatus])

  const onCategorySelect = (v: FeedbackCategory) => { setCategory(v) }
  const onStatusSelect = (v: FeedbackStatus) => { setStatus(v) }
  const onCancel = () => {
    navigate(returnURL, { state: { from: returnURLState } });
  }

  const isFormDataValid = () => {
    const textErrors = [isEmpty(title), isEmpty(description)];

    const isValid = textErrors.find(e => e) === undefined;

    if (!isValid)
      setTextErrorInput(textErrors);

    return isValid;

    function isEmpty(text: string) {
      return (text.length === 0 || text.trim().length === 0);
    };

  }

  const onInputFocus = (inputIndex: number) => {
    if (errorTextInput[inputIndex]) {
      const textErrors = [...errorTextInput];
      textErrors[inputIndex] = false;
      setTextErrorInput(textErrors)
    }
  }

  const handleEdit = async () => {
    if (!isFormDataValid())
      return;

    setLock(true);
    setLoading(true);
    const updatedProductRequest = {
      id: productRequest.id,
      title: title,
      category: category,
      upvotes: productRequest.upvotes,
      status: status,
      description: description,
      comments: productRequest.comments,
      commentsLength: productRequest.commentsLength
    }
    await postProductRequestEdit(updatedProductRequest);
    navigate(rootURL + '/detail/' + productRequest.id, { state: { from: returnURLState } })
  }

  const handleNew = async () => {
    if (!isFormDataValid())
      return;

    setLock(true);
    setLoading(true);
    const response = await postProductRequest(title, category, description);
    dispatch(setCurrentUser(response.currentUser));
    navigate(rootURL + '/detail/' + response.productRequest.id, { state: { from: forwardURLState } });
  }

  const handleDelete = async () => {
    setLock(true);
    setLoading(true);
    const response = await deleteProductRequest(productRequest.id);
    dispatch(setCurrentUser(response));

    if (returnURL === '/') {
      //Case: Edit page is loaded directly
      navigate(returnURL, { state: { from: returnURLState } });
    } else {
      //Case: Reached edit page from detail page
      const updatedReturnURL = returnURLState[returnURLState.length - 1] 
      const updatedReturnURLState = returnURLState.length > 1 ? returnURLState.slice(0, returnURLState.length - 1) : ['/'];
      navigate(updatedReturnURL, { state: { from: updatedReturnURLState } });
    }
  }

  return (
    <TransitionPage>
      <div className={`feedback-page${isEdit ? ' edit' : ''}${loading ? ' loading' : ''}`}>
        {
          lock ? <a className='return-link'>Go Back</a> :
            <Link to={returnURL} state={{ from: returnURLState }} className={`return-link`}>Go Back</Link>
        }

        <div className='card'>
          <img className='card-icon' src={isEdit ? IconEdit : IconNew} />
          <div className='card-title'>{isEdit ? `Editing '${productRequest.title}'` : 'Create New Feedback'}</div>
          <div className={`feedback-input${errorTextInput[0] ? ' error' : ''}`}>
            <div className='title'>Feedback Title</div>
            <div className='desc'>Add a short, descriptive headline</div>
            <input type='text' value={title} onFocus={() => onInputFocus(0)} onChange={(e) => setTitle(e.currentTarget.value)} disabled={lock} />
            {errorTextInput[0] ? <div className='error-text'>Can't be empty</div> : null}
          </div>
          <div className="feedback-input">
            <div className='title'>Category</div>
            <div className='desc'>Choose a category for your feedback</div>
            <CategoryDropdown callback={onCategorySelect} value={category} disabled={lock} />
          </div>
          {
            isEdit ?
              <div className="feedback-input">
                <div className='title'>Update Status</div>
                <div className='desc'>Change feedback state</div>
                <StatusDropdown callback={onStatusSelect} value={status} disabled={lock} />
              </div> :
              null
          }
          <div className={`feedback-input${errorTextInput[1] ? ' error' : ''}`}>
            <div className='title'>Feedback Detail</div>
            <div className='desc'>Include any specific comments on what should be improved, added, etc.</div>
            <textarea value={description} onFocus={() => onInputFocus(1)} onChange={(e) => setDescription(e.currentTarget.value)} disabled={lock} />
            {errorTextInput[1] ? <div className='error-text'>Can't be empty</div> : null}
          </div>
          <div className="form-controls">
            {isEdit ? <button className='form-delete link-button bt-3' onClick={handleDelete} disabled={lock}>Delete</button> : null}
            <button className='form-cancel link-button bt-2' onClick={onCancel} disabled={lock}>Cancel</button>
            <input
              type='submit'
              value={isEdit ? 'Save Changes' : 'Add Feedback'}
              onClick={() => isEdit ? handleEdit() : handleNew()}
              disabled={lock}
              className='form-add link-button bt-1'
            />
          </div>
        </div>
      </div>
    </TransitionPage>
  );
}

export default FeedbackPage;