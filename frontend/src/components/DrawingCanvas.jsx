import React, { useRef, useEffect, useState } from 'react';
import { FaEraser } from 'react-icons/fa';
import Modal from './Modal'; // Import the Modal component

const DrawingCanvas = () => {
    const canvasRef = useRef(null);
    const isDrawing = useRef(false);
    const ctxRef = useRef(null);
    const [strokeColor, setStrokeColor] = useState('white');
    const [lineWidth, setLineWidth] = useState(5);
    const [isEraser, setIsEraser] = useState(false);
    const [selectedColor, setSelectedColor] = useState('white');
    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal
    const [loading, setLoading] = useState(false); // State for loading feedback

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const context = canvas.getContext('2d');
        context.fillStyle = 'rgba(17, 17, 17, 0.99)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        ctxRef.current = context;

        document.body.style.overflow = 'hidden';

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            resetCanvas(); // Clear the canvas when resizing
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.body.style.overflow = 'auto';
        };
    }, []);

    const startDrawing = (e) => {
        isDrawing.current = true;
        draw(e);
    };

    const stopDrawing = () => {
        isDrawing.current = false;
        ctxRef.current.beginPath();
    };

    const draw = (e) => {
        if (!isDrawing.current) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctxRef.current.lineWidth = lineWidth;
        ctxRef.current.lineCap = 'round';
        ctxRef.current.strokeStyle = isEraser ? 'rgba(17, 17, 17, 0.99)' : strokeColor;

        ctxRef.current.lineTo(x, y);
        ctxRef.current.stroke();
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(x, y);
    };

    const handleThicknessChange = (e) => {
        setLineWidth(e.target.value);
    };

    const handleColorChange = (color) => {
        setStrokeColor(color);
        setSelectedColor(color);
        setIsEraser(false);
    };

    const resetCanvas = () => {
        const canvas = canvasRef.current;
        ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
        ctxRef.current.fillStyle = 'rgba(17, 17, 17, 0.99)';
        ctxRef.current.fillRect(0, 0, canvas.width, canvas.height);
    };

    const toggleEraser = () => {
        setIsEraser(!isEraser);
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const calculateDrawing = () => {
        const canvas = canvasRef.current;
        const imageDataURL = canvas.toDataURL('image/png'); // Convert canvas to base64
        console.log(imageDataURL); // Log base64 image to console
         
        var a = document.createElement("a"); 
        a.href = "data:image/png;base64," + imageDataURL; 
        a.download = "Image.png"; 
        a.click();
        
        setLoading(true);
        setTimeout(() => {
            setLoading(false); // Reset loading state
        }, 1000);
    };

    return (
        <div className="relative h-screen w-screen">
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseMove={draw}
                className="absolute inset-0"
            />

            {/* Color Palette on the Left (Horizontal) */}
            <div className="absolute rounded-e-lg bg-gray-700 top-48 left-0 flex flex-col pl-6 pt-4 pb-4 pr-3 space-y-4">
                {['red', 'green', 'blue', 'yellow', 'orange', 'purple', 'black', 'white', 'brown'].map((color) => (
                    <button
                        key={color}
                        className={`w-8 h-8 rounded-full ${selectedColor === color ? 'border-2 border-white' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorChange(color)}
                    />
                ))}
            </div>

            {/* Buttons on the Top Right */}
            <div className="absolute top-4 right-4 space-x-3">
                <button
                    onClick={resetCanvas}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                    Reset
                </button>
                <button
                    onClick={calculateDrawing}
                    className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading} // Disable button while loading
                >
                    {loading ? 'Calculating...' : 'Calculate'}
                </button>
            </div>

            {/* Thickness Slider in the Center */}
            <div className="absolute top-0 pt-5 rounded-b-lg bg-gray-700 w-80 px-7 pb-3 left-1/2 transform -translate-x-1/2">
                <input
                    type="range"
                    min="1"
                    max="20"
                    value={lineWidth}
                    onChange={handleThicknessChange}
                    className="w-full"
                />
                <label className="text-white">Thickness: {lineWidth}px</label>
            </div>

            {/* Eraser Button with Icon */}
            <div className="absolute top-32 left-2">
                <button
                    onClick={toggleEraser}
                    className={`bg-gray-500 text-white px-4 pl-5 py-4 rounded hover:bg-gray-700 flex items-center`}
                >
                    <FaEraser className="mr-2" />
                </button>
            </div>

            {/* Details and Donation Buttons */}
            <div className="absolute top-4 left-4 space-x-3">
                <button 
                    onClick={openModal}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-700"
                >
                    Details
                </button>
                <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700">
                    Donation
                </button>
            </div>

            {/* Modal for Details */}
            <Modal isOpen={isModalOpen} onClose={closeModal} />
        </div>
    );
};

export default DrawingCanvas;