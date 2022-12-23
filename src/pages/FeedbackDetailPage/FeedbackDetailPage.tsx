import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { LocationState, rootURL } from '../../components/App/App';
import TransitionPage from '../../components/App/TransitionPage/TransitionPage';
import SuggestCard, { SuggestCardLoading } from '../../components/SuggestCard/SuggestCard';
import { fetchProductRequest, postComment, postReply, selectCurrentUser, selectProductRequest, setCurrentUser, setProductRequest, setUpvote } from '../../redux/data/dataSlice';
import AddComment from './components/AddComment/AddComment';
import CommentCard, { ChildCommentCard } from './components/CommentCard/CommentCard';
import './FeedbackDetailPage.scss';

function FeedbackDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();;
  const history = (location.state as LocationState) ? (location.state as LocationState).from : [rootURL + '/'];
  const returnURL = history[history.length - 1];
  const returnURLState = history.length > 1 ? history.slice(0, history.length - 1) : history;
  const forwardURLState = [...history, location.pathname];

  const { id } = useParams();
  const productRequestData = useSelector(selectProductRequest);
  const currentUserData = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchProductRequest(id || ''));
  }, [dispatch, id])

  useEffect(() => {
    if (productRequestData.productRequestStatus === 'error') navigate(rootURL)
  }, [navigate, productRequestData.productRequestStatus])

  const currentUser = currentUserData.currentUser;
  const productRequest = productRequestData.productRequest;
  const isLoading = productRequestData.productRequestStatus !== 'ready'

  const postCommentCallback = async (content: string): Promise<boolean> => {
    const response = await postComment(productRequestData.productRequest.id, content)
    dispatch(setProductRequest(response))
    return true;
  }

  const postReplyCallback = async (commentId: number, content: string, replyingTo: string): Promise<boolean> => {
    const response = await postReply(productRequestData.productRequest.id, commentId, content, replyingTo)
    dispatch(setProductRequest(response))
    return true;
  }

  const upvoteCallback = async (productRequestId: number) => {
    const response = await setUpvote(productRequestId);
    dispatch(setProductRequest(response.productRequest));
    dispatch(setCurrentUser(response.currentUser))
  }

  return (
    <TransitionPage>
      <div className='feedback-detail-page'>
        <div className='header'>
          <Link to={returnURL} state={{ from: returnURLState }} className='return-link'>Go Back</Link>
          <Link to={rootURL + '/edit/' + id} state={{ from: forwardURLState }} className={`edit-button link-button bt-4${isLoading ? ' loading' : ''}`}>Edit Feedback</Link>
        </div>
        {isLoading ? <SuggestCardLoading cardCount={1} /> :
          <SuggestCard
            id={productRequest.id}
            title={productRequest.title}
            desc={productRequest.description}
            upvotes={productRequest.upvotes}
            isUpvoted={currentUser.upvoted.includes(productRequest.id)}
            category={productRequest.category}
            commentsLength={productRequest.commentsLength}
            className='detail'
            upvoteCallback={upvoteCallback} />
        }

        {
          isLoading || productRequest.commentsLength === 0 ? null :
            <div className='comments suggest-card'>
              <div className='title'>{`${productRequest.commentsLength} ${productRequest.commentsLength === 1 ? 'Comment' : 'Comments'}`}</div>
              {
                productRequest.comments.map((comment, index, arr) => {
                  if (comment.replies.length === 0) {
                    return (
                      <React.Fragment key={index}>
                        <CommentCard commentId={comment.id} data={comment} hasChild={false} isLast={true} postCallback={postReplyCallback} />
                        {index + 1 === arr.length ? null : <hr className='comment-divider divider' />}
                      </React.Fragment>
                    )
                  }
                  return (
                    <React.Fragment key={index}>
                      <CommentCard commentId={comment.id} data={comment} hasChild={true} isLast={false} postCallback={postReplyCallback} />
                      {
                        comment.replies.map((reply, innerIndex, innerArr) => {
                          if (innerIndex + 1 === innerArr.length) {
                            return (
                              <React.Fragment key={'c' + innerIndex} >
                                <ChildCommentCard commentId={comment.id} data={reply} isLastChild={true} postCallback={postReplyCallback} />
                                {index + 1 === arr.length ? null : <hr className='comment-divider divider' />}
                              </React.Fragment>
                            )
                          }
                          return <ChildCommentCard
                            commentId={comment.id}
                            key={'c' + innerIndex}
                            data={reply}
                            isLastChild={false}
                            postCallback={postReplyCallback} />
                        })
                      }
                    </React.Fragment>
                  )
                })
              }
            </div>
        }
        <AddComment loading={isLoading} postCallback={postCommentCallback} />
      </div>
    </TransitionPage>
  );
}

export default FeedbackDetailPage;