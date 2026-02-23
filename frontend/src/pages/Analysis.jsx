import React, { useState } from 'react';

const Analysis = () => {
    const [videoFile, setVideoFile] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (event) => {
        setVideoFile(event.target.files[0]);
        setAnalysisResult(null);
        setError(null);
    };

    const handleAnalyze = async () => {
        if (!videoFile) {
            setError("Please select a video file first.");
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('video', videoFile);

        try {
            const response = await fetch('http://localhost:5000/api/analysis/analyze-video', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Analysis failed');
            }

            const result = await response.json();
            setAnalysisResult(result);
        } catch (err) {
            console.error("Analysis Error:", err);
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Behavioral Video Analysis</h1>

            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Upload Video</h2>
                <p className="text-gray-600 mb-4">
                    Upload a short video clip of the child behavior for analysis. Supported formats: MP4, AVI, MOV.
                </p>

                <div className="flex items-center space-x-4">
                    <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
                    />
                    <button
                        onClick={handleAnalyze}
                        disabled={!videoFile || loading}
                        className={`px-6 py-2 rounded-lg text-white font-medium transition-colors
              ${!videoFile || loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {loading ? 'Analyzing...' : 'Analyze Video'}
                    </button>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
                        {error}
                    </div>
                )}
            </div>

            {analysisResult && (
                <div className="bg-white shadow-md rounded-lg p-6 animate-fade-in">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Analysis Results</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className={`p-4 rounded-lg border-l-4 ${analysisResult.riskScore > 0.6 ? 'bg-red-50 border-red-500' :
                                analysisResult.riskScore > 0.3 ? 'bg-yellow-50 border-yellow-500' : 'bg-green-50 border-green-500'
                            }`}>
                            <p className="text-sm text-gray-500 uppercase tracking-wide">Risk Assessment</p>
                            <p className="text-2xl font-bold">{analysisResult.behaviorClass}</p>
                            <p className="text-lg">Score: {analysisResult.riskScore} / 1.0</p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-500 uppercase tracking-wide">Details</p>
                            <ul className="mt-2 space-y-1">
                                <li><span className="font-medium">Processed Frames:</span> {analysisResult.details.processedFrames}</li>
                                <li><span className="font-medium">Avg Gaze Deviation:</span> {analysisResult.details.avgGazeDeviation}</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">AI Explanation (SHAP)</h3>
                        <div className="p-4 bg-blue-50 rounded-lg text-blue-900 border border-blue-100">
                            <p>{analysisResult.explanation}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analysis;
