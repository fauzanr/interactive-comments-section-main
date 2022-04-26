const { useRef, useEffect } = React;

const CommentEditForm = (props) => {
  const { comment } = props;
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    const endChar = textarea.value.length;
    textarea.setSelectionRange(endChar, endChar);
    textarea.focus();
  }, []);

  const updateComment = () => {
    const commentContent = textareaRef.current.value.trim();
    if (!commentContent) return;
    props.onUpdateComment(comment.id, commentContent);
  };

  return (
    <div className="comment__edit-form">
      <textarea
        className="comment-textarea"
        name="comment"
        id="comment"
        placeholder="Add a comment..."
        rows="3"
        defaultValue={comment.content}
        ref={textareaRef}
      ></textarea>
      <div className="comment__edit-form__actions">
        <button
          type="submit"
          className="button button-danger"
          onClick={props.onCancelEdit}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="button button-fill-primary"
          onClick={updateComment}
        >
          UPDATE
        </button>
      </div>
    </div>
  );
};
