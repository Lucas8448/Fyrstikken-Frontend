import React, { useState } from 'react';
import axios from 'axios'; // Assuming you're using Axios for HTTP requests

const EmailSender = () => {
  const [email, setEmail] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };
  }; 

  const handleSubmit = async () => {
    try {
      const response = await axios.post('YOUR_API_ENDPOINT', { email });
      console.log(response.data);
      alert('Email sent successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to send email.');
    }
  };

  return (
    <div>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={handleInputChange}
      />
      <button onClick={handleSubmit}>Send Email</button>
    </div>
  )};


export default EmailSender;
