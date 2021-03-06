const { useState, useEffect, Fragment } = React;
const localStorageDataKey = "interactive-comments-section-comments-data";

const App = () => {
  const [currentUser, setCurrentUser] = useState({});
  const [comments, setComments] = useState([]);
  const [editCommentId, setEditCommentId] = useState(null);
  const [deleteCommentId, setDeleteCommentId] = useState(null);
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const localStorageData = localStorage.getItem(localStorageDataKey);
    const data = JSON.parse(localStorageData);

    if (data) {
      setCurrentUser(data.currentUser);
      setComments(data.comments);
      return;
    }

    fetch("data.json")
      .then((res) => res.json())
      .then((data) => {
        setCurrentUser(data.currentUser);
        setComments(data.comments);
      })
      .catch(console.log);
  }, []);

  const updateComments = (action = "", data = {}) => {
    let found = false;

    const mapComments = (action = "", data = {}, comments = []) => {
      return comments
        .filter((comment) => {
          if (found) return true;

          if (action === "delete" && comment.id === data.commentId) {
            found = true;
            return false;
          }
          return true;
        })
        .map((comment) => {
          if (found) return comment;

          if (comment.id === data.commentId) {
            found = true;
            if (action === "reply") {
              const newComment = {
                id: Math.random().toString(36).substring(2, 9),
                content: data.commentContent,
                createdAt: "Just now",
                score: 0,
                replyingTo: comment.user.username,
                user: { ...currentUser },
                replies: [],
              };
              comment.replies.push(newComment);
            }
            if (action === "update") {
              comment.content = data.commentContent;
            }
            if (action === "upvote") {
              comment.score = comment.score + 1;
            }
            if (action === "downvote") {
              comment.score = comment.score - 1;
            }
          } else if (!found) {
            comment.replies = mapComments(action, data, comment.replies);
          }
          return comment;
        });
    };

    const mappedComments = mapComments(action, data, comments);
    setComments(mappedComments);
    setLocalStorage(mappedComments);
  };

  const setLocalStorage = (comments) => {
    localStorage.setItem(
      localStorageDataKey,
      JSON.stringify({ currentUser, comments })
    );
  };

  const onSubmitReply = (commentReplyId, commentContent) => {
    if (commentReplyId == null) {
      const newComment = {
        id: Math.random().toString(36).substring(2, 9),
        content: commentContent,
        createdAt: "Just now",
        score: 0,
        user: { ...currentUser },
        replies: [],
      };
      const newComments = [...comments, newComment];
      setComments(newComments);
      setLocalStorage(newComments);
      setReplyToCommentId(null);
      return;
    }

    updateComments("reply", {
      commentId: commentReplyId,
      commentContent,
    });
    setReplyToCommentId(null);
  };

  const upvote = (commentId) => {
    updateComments("upvote", { commentId });
  };

  const downvote = (commentId) => {
    updateComments("downvote", { commentId });
  };

  const onUpdateComment = (commentId, commentContent) => {
    if (commentId == null) return;

    updateComments("update", {
      commentId: commentId,
      commentContent,
    });
    setEditCommentId(null);
  };

  const deleteComment = () => {
    const commentId = deleteCommentId;
    if (commentId == null) return;

    updateComments("delete", { commentId });
    closeModal();
  };

  const onDeleteComment = (commentId) => {
    setDeleteCommentId(commentId);
    setShowModal(true);
  };

  const closeModal = () => {
    setDeleteCommentId(null);
    setShowModal(false);
  };

  const renderComment = (comments, indentLevel = 0) => {
    return comments.map((comment) => (
      <Fragment key={comment.id}>
        <Comment
          currentUser={currentUser}
          comment={comment}
          indentLevel={indentLevel}
          isEditing={comment.id === editCommentId}
          isReplying={comment.id === replyToCommentId}
          editComment={(commentId) => setEditCommentId(commentId)}
          replyToComment={(commentId) => setReplyToCommentId(commentId)}
          onUpdateComment={onUpdateComment}
          onDeleteComment={onDeleteComment}
          onUpvote={upvote}
          onDownvote={downvote}
        />
        {renderComment(comment.replies, indentLevel + 1)}
        {replyToCommentId === comment.id && (
          <CommentReplyForm
            currentUser={currentUser}
            indentLevel={indentLevel + 1}
            isReplying={comment.id === replyToCommentId}
            commentReplyId={comment.id}
            onCancelReply={() => setReplyToCommentId(null)}
            onSubmitReply={onSubmitReply}
            autoFocus
          />
        )}
      </Fragment>
    ));
  };

  let commentsView = renderComment(comments, 0);

  return (
    <Fragment>
      <div className="comments">
        {commentsView}
        {currentUser.username && (
          <CommentReplyForm
            currentUser={currentUser}
            onSubmitReply={onSubmitReply}
          />
        )}
      </div>
      <CommentDeleteModal
        show={showModal}
        onCloseModal={closeModal}
        onDeleteComment={deleteComment}
      />
    </Fragment>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
