import React, {useState} from 'react';
import '../App.css'

const  Form = ({comment}) =>{

   const [message, setMessage] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        comment(message);
        setMessage("");
    }

    return (
        <form  onSubmit={handleSubmit}>
            <label className="text" htmlFor='message'>Message</label>
            <textarea
                
                id="message"
                placeholder='Leave a message...'
                value={message}
                onChange={(e) => { setMessage(e.target.value) }}
            />

            <button className="waveButton" type="submit">Submit</button>
        </form>
    )
  
}

export default Form