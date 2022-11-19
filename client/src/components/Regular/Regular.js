import React, { useState } from 'react';
import axios from 'axios';
import './Regular.scss';
import LoadingDots from '../imgs/loading-dots.gif';

const Regular = () => {
  const [file, setFile] = useState(null);
  const [inputContainsFile, setInputContainsFile] = useState(false);
  const [currentlyUploading, setCurrentlyUploading] = useState(false);
  const [imageId, setImageId] = useState(null);
  const [progress, setProgress] = useState(null);

  const handleFile = (e) => {
    setFile(e.target.files[0]);
    setInputContainsFile(true);
  }

  const fileUploadHandler = () => {
    const fd = new FormData();
    fd.append('image', file, file.name)

    axios.post('/api/image/upload', fd, {
      onUploadProgress: (progressEvent) => {
        setProgress((progressEvent.loaded / progressEvent.total) * 100);
        console.log(
          'upload progress:',
          Math.round((progressEvent.loaded / progressEvent.total) * 100)
        );
      }
    }).then(({ data }) => {
      setImageId(data);
      setFile(null);
      setInputContainsFile(false);
      setCurrentlyUploading(false);
    }).catch((err) => {
      console.log(err);
      if (err.response.status === 400) {
        const errMsg = err.response.data;
        if (errMsg) {
          console.log(errMsg)
          alert(errMsg)
        }
      } else {
        console.log('other error:', err);
        setInputContainsFile(false);
        setCurrentlyUploading(false);
      }
    })

  }

  const handleClick = () => {
    if (inputContainsFile) {
      setCurrentlyUploading(true);
      fileUploadHandler();
    }
  }
  return (
    <div className='regular'>
      <div className='inputContainer'>
        {
          currentlyUploading ? (
            <img src={LoadingDots} className='loadingdots' alt='upload in progress' />
          ) : (
            <>
              <input
                className='file-input'
                type='file'
                name='file'
                id='file'
                onChange={handleFile}
              />
              <label
                htmlFor='file'
                onClick={handleClick}
                className={`inputlabel ${file && 'file-selected'}`}
              >
                {file ? <>SUBMIT</> : <>REGULAR VERSION</>}
              </label>
            </>
          )
        }
      </div>
    </div>
  )
}

export default Regular
