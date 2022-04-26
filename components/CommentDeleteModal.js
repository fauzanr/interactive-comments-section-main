const { useRef } = React;

const CommentDeleteModal = (props) => {
  const { show = false } = props;
  const overlayRef = useRef(null);

  const action = (e) => {
    if (e.target.contains(overlayRef.current)) props.onCloseModal();
  };

  return (
    show && (
      <div className="modal-overlay" onClick={action} ref={overlayRef}>
        <div className="modal-container">
          <h3 className="modal-title">Delete Comment</h3>
          <p>
            Are you sure you want to delete this comment? This will remove the
            comment and can't be undone.
          </p>
          <div className="modal-footer">
            <button
              className="button button-fill-default"
              onClick={props.onCloseModal}
            >
              NO, CANCEL
            </button>
            <button
              className="button button-fill-danger"
              onClick={props.onDeleteComment}
            >
              YES, DELETE
            </button>
          </div>
        </div>
      </div>
    )
  );
};
