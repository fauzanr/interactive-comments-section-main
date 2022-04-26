const { useRef, useEffect } = React;

const CommentReplyForm = (props) => {
  const {
    currentUser = {},
    indentLevel = 0,
    commentReplyId = null,
    isReplying = false,
    autoFocus = false,
  } = props;
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!autoFocus) return;
    const textarea = textareaRef.current;
    const endChar = textarea.value.length;
    textarea.setSelectionRange(endChar, endChar);
    textarea.focus();
  }, [autoFocus]);

  const sendReply = () => {
    const commentContent = textareaRef.current.value.trim();
    if (!commentContent) return;
    props.onSubmitReply(commentReplyId, commentContent);
  };

  return (
    <div className="comment-wrapper">
      {[...Array(indentLevel)].map((_, i) => (
        <div key={i} className="comment-indent">
          <div className="comment-indent__threadline"></div>
        </div>
      ))}
      <div className="comment-form">
        <img
          src={currentUser.image && currentUser.image.webp}
          width="40"
          height="40"
          alt={currentUser.username}
        />
        <textarea
          className="comment-textarea"
          name="comment"
          id="comment"
          placeholder="Add a comment..."
          rows="3"
          ref={textareaRef}
        ></textarea>
        <div className="comment-form__actions">
          <button
            type="submit"
            className="button button-fill-primary"
            onClick={sendReply}
          >
            SEND
          </button>
          {isReplying && (
            <button
              type="submit"
              className="button button-danger"
              onClick={props.onCancelReply}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
