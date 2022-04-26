const { useState, useEffect, Fragment } = React;

const App = () => {
  const [currentUser, setCurrentUser] = useState({});
  const [comments, setComments] = useState([]);
  const [editCommentId, setEditCommentId] = useState(null);
  const [replyToCommentId, setReplyToCommentId] = useState(null);

  useEffect(() => {
    fetch("data.json")
      .then((res) => res.json())
      .then((data) => {
        setCurrentUser(data.currentUser);
        setComments(data.comments);
      })
      .catch(console.log);
  }, []);

  const mapComments = (action = "", data = {}, comments = []) => {
    let found = false;

    const mappedComments = comments.map((comment) => {
      if (comment.id === data.commentId) {
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
        found = true;
      }
      if (!found) mapComments(action, data, comment.replies);
      return comment;
    });

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

    mapComments(
      "reply",
      {
        commentId: commentReplyId,
        commentContent,
      },
      comments
    );
    setReplyToCommentId(null);
  };

  const onUpdateComment = (commentId, commentContent) => {
    if (commentId == null) return;

    mapComments(
      "update",
      {
        commentId: commentId,
        commentContent,
      },
      comments
    );
    setEditCommentId(null);
  };

  const onDeleteComment = (commentId) => {
    if (commentId == null) return;

    mapComments("delete", { commentId: commentId }, comments);
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
    </Fragment>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
