import React, { useEffect, useState } from "react";

const InvoiceComments = ({ comments, onCommentChange }) => {
  const [charactercommCount, setcharactercommCount] = useState(0);
  const maxCharacters = 499;

  useEffect(() => {
      setcharactercommCount(comments.length);
    }, [comments]);

  return (
    <div style={{ marginTop: '-94px' }}>
      <h4>
      <span style={{ color: 'red' }}>*</span>
        Work Complete/Invoice Comments
      </h4>
      <textarea
        maxLength="499"
        className="form-control"
        value={comments}
        onChange={onCommentChange}
        placeholder="All works are completed"
        style={{ width: '100%', height:'45px',resize: 'none', fontFamily: 'Verizon NHG eDS ' }}
      />
 <div style={{ textAlign: 'right', fontSize: '12px', marginTop: '5px', color: charactercommCount > maxCharacters * 0.8 ? 'red' : 'gray', fontFamily: 'Verizon NHG eDS ' }}>
        {charactercommCount} / {maxCharacters} characters
      </div>

    </div>
  );
};

export default InvoiceComments;