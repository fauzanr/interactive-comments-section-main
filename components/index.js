const { useState, useEffect, Fragment } = React;

const App = () => {
  const [currentUser, setCurrentUser] = useState({});
  const [comments, setComments] = useState([]);
  const [editCommentId, setEditCommentId] = useState(null);
  const [deleteCommentId, setDeleteCommentId] = useState(null);
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
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
          } else if (!found) {
            comment.replies = mapComments(action, data, comment.replies);
          }
          return comment;
        });
    };

    const mappedComments = mapComments(action, data, comments);
    setComments(mappedComments);
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
      setComments((comments) => [...comments, newComment]);
      setReplyToCommentId(null);
      return;
    }

    updateComments("reply", {
      commentId: commentReplyId,
      commentContent,
    });
    setReplyToCommentId(null);
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
        <CommentReplyForm
          currentUser={currentUser}
          onSubmitReply={onSubmitReply}
        />
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
