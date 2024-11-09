import React, { useRef, useEffect, useState } from 'react';
import { FaEraser } from 'react-icons/fa';
import Modal from './Modal';

const DrawingCanvas = () => {
    const canvasRef = useRef(null);
    const isDrawing = useRef(false);
    const ctxRef = useRef(null);
    const [strokeColor, setStrokeColor] = useState('white');
    const [lineWidth, setLineWidth] = useState(5);
    const [isEraser, setIsEraser] = useState(false);
    const [selectedColor, setSelectedColor] = useState('white');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [answer, setAnswer] = useState(""); 

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
            resetCanvas();
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
        setAnswer(""); // Reset the answer state
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

    const calculateDrawing = async () => {
        const canvas = canvasRef.current;
        const imageDataURL = canvas.toDataURL('image/png');

        setLoading(true);

        try {
            const response = await fetch('http://localhost:8000/save-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: imageDataURL }),
            });

            const result = await response.json();
            if (response.ok) {
                
                resetCanvas();
                if (result.expr && result.result) {
                    setAnswer(`${result.expr}=${result.result}`); 
                } else {
                    console.error('Invalid response format:', result);
                }
            } else {
                console.error('Failed to save image:', result.message);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
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

            
            <div className="absolute top-4 right-4 space-x-3">
                <button
                    onClick={resetCanvas}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                    Reset All
                </button>
                <button
                    onClick={calculateDrawing}
                    className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading}
                >
                    {loading ? 'Calculating...' : 'Calculate'}
                </button>
            </div>

          
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

        
            <div className="absolute top-32 left-2">
                <button
                    onClick={toggleEraser}
                    className={`bg-gray-500 text-white px-4 pl-5 py-4 rounded hover:bg-gray-700 flex items-center`}
                >
                    <FaEraser className="mr-2" />
                </button>
            </div>

           
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

           
            {answer && (
                <div className="absolute text-white text-[50px] font-bold" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                    {answer}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={closeModal} />
        </div>
    );
};

export default DrawingCanvas;