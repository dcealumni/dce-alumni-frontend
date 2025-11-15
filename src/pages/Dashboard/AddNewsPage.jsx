import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaTimes, FaNewspaper, FaImage, FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';

const AddNewsPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [highlights, setHighlights] = useState(['']);

    const [newsData, setNewsData] = useState({
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
        photoLink: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewsData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 10) {
            Swal.fire({
                title: 'Too Many Images',
                text: 'You can only upload up to 10 images.',
                icon: 'warning'
            });
            return;
        }

        const validFiles = files.filter(file => {
            if (file.size > 10 * 1024 * 1024) {
                Swal.fire({
                    title: 'File Too Large',
                    text: `${file.name} is larger than 10MB. Please choose a smaller file.`,
                    icon: 'warning'
                });
                return false;
            }
            return true;
        });

        setSelectedImages(validFiles);
    };

    const removeImage = (index) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const addHighlight = () => {
        setHighlights(prev => [...prev, '']);
    };

    const updateHighlight = (index, value) => {
        setHighlights(prev => 
            prev.map((highlight, i) => i === index ? value : highlight)
        );
    };

    const removeHighlight = (index) => {
        if (highlights.length > 1) {
            setHighlights(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!newsData.title.trim()) {
            Swal.fire({
                title: 'Missing Title',
                text: 'Please enter a news title.',
                icon: 'warning'
            });
            return;
        }

        if (!newsData.date) {
            Swal.fire({
                title: 'Missing Date',
                text: 'Please select a date for the news.',
                icon: 'warning'
            });
            return;
        }

        setLoading(true);

        // Show uploading progress
        Swal.fire({
            title: 'Creating Latest News...',
            html: 'Uploading images and saving news...',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const formData = new FormData();
            
            // Add basic news data
            formData.append('title', newsData.title);
            formData.append('date', newsData.date);
            formData.append('time', newsData.time);
            formData.append('location', newsData.location);
            formData.append('description', newsData.description);
            formData.append('photoLink', newsData.photoLink);
            
            // Add highlights
            const validHighlights = highlights.filter(h => h.trim() !== '');
            formData.append('highlights', JSON.stringify(validHighlights));
            
            // Add images
            selectedImages.forEach(image => {
                formData.append('images', image);
            });

            // 🔥 Use the news-specific endpoint
            const response = await axios.post('https://dce-server.vercel.app/events/news', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                Swal.fire({
                    title: 'Success! 📰',
                    text: 'Latest news created successfully!',
                    icon: 'success',
                    confirmButtonColor: '#10b981'
                }).then(() => {
                    navigate('/dashboard/events');
                });
            } else {
                throw new Error(response.data.message || 'Failed to create news');
            }
        } catch (error) {
            console.error('Error creating news:', error);
            Swal.fire({
                title: 'Error!',
                text: `Failed to create news: ${error.response?.data?.message || error.message}`,
                icon: 'error',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <FaNewspaper className="text-2xl text-green-600" />
                    <h1 className="text-2xl font-bold">Add Latest News</h1>
                </div>
                <button
                    onClick={() => navigate('/dashboard/events')}
                    className="btn btn-outline btn-sm"
                >
                    <FaTimes className="mr-2" />
                    Cancel
                </button>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* News Title */}
                        <div className="lg:col-span-2">
                            <label className="label">
                                <span className="label-text font-medium">News Title *</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={newsData.title}
                                onChange={handleInputChange}
                                className="input input-bordered w-full"
                                placeholder="Enter latest news title..."
                                required
                            />
                        </div>

                        {/* Date */}
                        <div>
                            <label className="label">
                                <span className="label-text font-medium flex items-center gap-2">
                                    <FaCalendarAlt className="text-green-500" />
                                    News Date *
                                </span>
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={newsData.date}
                                onChange={handleInputChange}
                                className="input input-bordered w-full"
                                max={new Date().toISOString().split('T')[0]} // Allow today and past dates
                                required
                            />
                        </div>

                        {/* Time */}
                        <div>
                            <label className="label">
                                <span className="label-text font-medium flex items-center gap-2">
                                    <FaClock className="text-green-500" />
                                    Time (Optional)
                                </span>
                            </label>
                            <input
                                type="time"
                                name="time"
                                value={newsData.time}
                                onChange={handleInputChange}
                                className="input input-bordered w-full"
                            />
                        </div>

                        {/* Location */}
                        <div className="lg:col-span-2">
                            <label className="label">
                                <span className="label-text font-medium flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-green-500" />
                                    Related Location (Optional)
                                </span>
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={newsData.location}
                                onChange={handleInputChange}
                                className="input input-bordered w-full"
                                placeholder="Enter location if news is location-specific..."
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium">News Description *</span>
                        </label>
                        <textarea
                            name="description"
                            value={newsData.description}
                            onChange={handleInputChange}
                            className="textarea textarea-bordered w-full h-32"
                            placeholder="Write the full news article content..."
                            required
                        ></textarea>
                    </div>

                    {/* Highlights */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium">News Highlights/Key Points</span>
                        </label>
                        <div className="space-y-2">
                            {highlights.map((highlight, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={highlight}
                                        onChange={(e) => updateHighlight(index, e.target.value)}
                                        className="input input-bordered flex-1"
                                        placeholder={`Key point ${index + 1} (e.g., "New appointment", "Award received")...`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeHighlight(index)}
                                        className="btn btn-outline btn-error btn-sm"
                                        disabled={highlights.length === 1}
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addHighlight}
                                className="btn btn-outline btn-sm"
                            >
                                <FaPlus className="mr-2" />
                                Add Highlight
                            </button>
                        </div>
                    </div>

                    {/* Images */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium flex items-center gap-2">
                                <FaImage className="text-green-500" />
                                News Images (Max 10, 10MB each)
                            </span>
                        </label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="file-input file-input-bordered w-full"
                        />
                        <div className="text-sm text-gray-500 mt-1">
                            Upload relevant photos, documents screenshots, or event images
                        </div>
                        
                        {selectedImages.length > 0 && (
                            <div className="mt-4">
                                <h4 className="font-medium mb-2">Selected Images ({selectedImages.length}/10):</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {selectedImages.map((image, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={URL.createObjectURL(image)}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-24 object-cover rounded border"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error"
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Photo/Document Link */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Additional Resources Link</span>
                        </label>
                        <input
                            type="url"
                            name="photoLink"
                            value={newsData.photoLink}
                            onChange={handleInputChange}
                            className="input input-bordered w-full"
                            placeholder="https://drive.google.com/... (documents, official links, etc.)"
                        />
                        <div className="text-sm text-gray-500 mt-1">
                            Link to official documents, press releases, or additional resources
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-success flex-1"
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Publishing News...
                                </>
                            ) : (
                                <>
                                    <FaNewspaper className="mr-2" />
                                    Publish Latest News
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/events')}
                            className="btn btn-outline"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            {/* Info Box */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <FaNewspaper className="text-green-600 mt-1" />
                    <div>
                        <h4 className="font-medium text-green-800">News Publishing Guidelines</h4>
                        <ul className="text-sm text-green-700 mt-2 space-y-1">
                            <li>• Write clear, factual, and engaging news content</li>
                            <li>• Include relevant images and official documents</li>
                            <li>• Add key highlights for easy scanning</li>
                            <li>• Provide links to official sources when available</li>
                            <li>• News will appear in the "Latest News" section</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddNewsPage;