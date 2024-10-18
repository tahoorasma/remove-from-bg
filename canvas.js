import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './canvas.css';

function Canvas() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [selection, setSelection] = useState(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setResponseMessage("");
    setSelection(null);
  };

  const handleImageLoad = (event) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = event.target;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);
  };

  const handleMouseDown = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const width = 50;
    const height = 50;

    setSelection({ x, y, width, height });

    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile || !selection) {
      alert("Please select an image and a selection area.");
      return;
    }

    const { x, y, width, height } = selection;

    const xInt = Math.floor(x);
    const yInt = Math.floor(y);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://127.0.0.1:8000/remove-item/', formData, {
        params: { x: xInt, y: yInt, width, height }, 
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'arraybuffer',
      });

      const imageBlob = new Blob([response.data], { type: 'image/png' });
      const imageUrl = URL.createObjectURL(imageBlob);

      const canvas = canvasRef.current;
      const originalImageUrl = canvas.toDataURL('image/png');

      navigate('/result', { state: { original: originalImageUrl, result: imageUrl } });
    } catch (error) {
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      } else {
        console.error("Error:", error);
      }
      setResponseMessage("Error removing item.");
      alert("Error removing item.");
    }
  };

  return (
    <div className='main-page'>
      <h1>Item Removal from Background App</h1>
      <form onSubmit={handleSubmit}>
        <button style={{height:"38px"}}>
          <input type="file" accept="image/*" onChange={handleFileChange} required />
        </button>
        <button type="submit" className="btn btn-dark" style={{marginLeft:"20px"}}>Remove Item</button>
      </form>
      {selectedFile && (
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          style={{ border: "1px solid black", marginTop: "10px" }}
        >
          <img
            src={URL.createObjectURL(selectedFile)}
            alt="Selected"
            onLoad={handleImageLoad}
            style={{ display: "none" }}
          />
        </canvas>
      )}
      {responseMessage && <p>{responseMessage}</p>}
    </div>
  );
}

export default Canvas;
