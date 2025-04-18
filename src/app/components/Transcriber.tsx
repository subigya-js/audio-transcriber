import React from 'react'

const Transcriber = () => {
    return (
        <div className='border h-[40%] w-[40%] rounded-lg shadow-lg flex flex-col justify-center items-center'>
            <input
                type="file"
                accept="audio/*"
                className="border-2 border-gray-300 rounded-lg p-2 mb-4"
            />
            <button className="bg-blue-500 text-white rounded-lg p-2 mb-4 cursor-pointer">
                Transcribe
            </button>
            <div className="border-t-2 border-gray-300 w-full p-4">
                <h2 className="text-lg font-bold mb-2">Transcription</h2>
                <p className="text-gray-700">
                    {/* Transcription result will be displayed here */}
                </p>
            </div>
        </div>
    )
}

export default Transcriber