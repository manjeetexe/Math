// Modal.js
import React from 'react';

const Modal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleDonation = () => {
    // Add your donation link or process here
    window.open('https://your-donation-link.com', '_blank'); // Replace with your donation link
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-5 rounded-lg shadow-lg w-11/12 max-w-md">
        <h2 className="text-lg font-bold mb-2">About This App</h2>
        <p>
          This drawing app allows users to create and manipulate drawings
          on a canvas. Users can choose different colors, adjust line
          thickness, and even use an eraser to remove parts of their
          artwork. The app is designed to be intuitive and user-friendly,
          providing a seamless drawing experience 
          
        </p>
        
        {/* Donation Button */}
        <div className='flex gap-3'>
            <button 
            onClick={handleDonation} 
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
            >
            Make a Donation
            </button>

            <button 
            onClick={onClose} 
            className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
            Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;