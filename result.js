import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './result.css';

function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { original, result } = location.state || {};

  if (!original || !result) {
    return (
      <div className="result-page">
        <h2>No images to display.</h2>
        <button onClick={() => navigate('/')}>Go Back</button>
      </div>
    );
  }

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = result;
    link.download = 'processed_image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='result-page'>
      <h1>Item Removal from Background App</h1>
      <div className="images-row">
        <div className="image-frame">
          <h3>Original Image</h3>
          <img src={original} alt="Original" />
        </div>
        <div className="image-frame">
          <h3>Resultant Image</h3>
          <img src={result} alt="Result" />
        </div>
      </div>
      <button onClick={() => navigate('/')}>Go Back to Canvas</button>
      <button onClick={handleDownload} style={{marginLeft:"20px"}}>Download Result</button>
    </div>
  );
}

export default Result;
