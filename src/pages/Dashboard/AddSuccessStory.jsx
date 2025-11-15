import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaStar, FaUser, FaGraduationCap, FaBriefcase, FaQuoteLeft, FaImage, FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';

const AddSuccessStory = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        alumniName: '',
        graduationYear: '',
        currentPosition: '',
        company: '',
        achievement: '',
        description: '',
        quote: '',
        images: [],
        date: new Date().toISOString().split('T')[0], // Today's date
        eventType: 'Success Story'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, event.target.result]
                }));
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.alumniName || !formData.achievement) {
            Swal.fire({
                title: 'Missing Information',
                text: 'Please fill in at least the title, alumni name, and achievement.',
                icon: 'warning',
                confirmButtonColor: '#f59e0b'
            });
            return;
        }

        try {
            setLoading(true);
            
            Swal.fire({
                title: 'Creating Success Story...',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // 🔥 SIMPLE: Send as JSON with base64 images
            const response = await axios.post('https://dce-server.vercel.app/events', {
                ...formData,
                eventType: 'Success Story'
            });
            
            console.log('Response received:', response.data);
            
            // 🔥 This will now work with fixed backend
            if (response.data.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Alumni success story has been created successfully!',
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonText: 'Create Another',
                    cancelButtonText: 'Back to Dashboard',
                    confirmButtonColor: '#10b981',
                    cancelButtonColor: '#6b7280'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Reset form
                        setFormData({
                            title: '',
                            alumniName: '',
                            graduationYear: '',
                            currentPosition: '',
                            company: '',
                            achievement: '',
                            description: '',
                            quote: '',
                            images: [],
                            date: new Date().toISOString().split('T')[0],
                            eventType: 'Success Story'
                        });
                    } else {
                        navigate('/dashboard/events');
                    }
                });
            }
        } catch (error) {
            console.error('Error creating success story:', error);
            console.error('Error response:', error.response?.data);
            
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to create success story. Please try again.',
                icon: 'error',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button 
                    onClick={() => navigate('/dashboard/events')}
                    className="btn btn-ghost btn-circle"
                >
                    <FaArrowLeft className="text-lg" />
                </button>
                <div className="flex items-center gap-3">
                    <FaStar className="text-3xl text-yellow-500" />
                    <h1 className="text-3xl font-bold text-gray-800">Add Alumni Success Story</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <FaUser className="text-yellow-500" />
                        Basic Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Story Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g., From Student to Industry Leader"
                                className="input input-bordered w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Alumni Name *
                            </label>
                            <input
                                type="text"
                                name="alumniName"
                                value={formData.alumniName}
                                onChange={handleInputChange}
                                placeholder="Full name of the alumnus/alumna"
                                className="input input-bordered w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Graduation Year
                            </label>
                            <input
                                type="number"
                                name="graduationYear"
                                value={formData.graduationYear}
                                onChange={handleInputChange}
                                placeholder="e.g., 2015"
                                min="1990"
                                max="2030"
                                className="input input-bordered w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Position
                            </label>
                            <input
                                type="text"
                                name="currentPosition"
                                value={formData.currentPosition}
                                onChange={handleInputChange}
                                placeholder="e.g., Senior Research Scientist"
                                className="input input-bordered w-full"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Company/Organization
                            </label>
                            <input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleInputChange}
                                placeholder="e.g., Google Research Institute"
                                className="input input-bordered w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Achievement & Story */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <FaBriefcase className="text-yellow-500" />
                        Achievement & Story
                    </h2>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Key Achievement *
                            </label>
                            <input
                                type="text"
                                name="achievement"
                                value={formData.achievement}
                                onChange={handleInputChange}
                                placeholder="e.g., Developed eco-friendly dyeing process reducing water consumption by 40%"
                                className="input input-bordered w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Story
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Write the complete success story, career journey, challenges overcome, etc."
                                className="textarea textarea-bordered w-full h-32"
                                rows="6"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaQuoteLeft className="inline mr-2" />
                                Inspirational Quote (Optional)
                            </label>
                            <textarea
                                name="quote"
                                value={formData.quote}
                                onChange={handleInputChange}
                                placeholder="A motivational quote or advice from the alumni to current students"
                                className="textarea textarea-bordered w-full h-20"
                                rows="3"
                            />
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <FaImage className="text-yellow-500" />
                        Photos
                    </h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Photos
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="file-input file-input-bordered w-full"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Upload professional photos, workplace images, or achievement photos
                            </p>
                        </div>

                        {formData.images.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {formData.images.map((image, index) => (
                                    <div key={index} className="relative">
                                        <img 
                                            src={image} 
                                            alt={`Upload ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Publication Date */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <FaCalendarAlt className="text-yellow-500" />
                        Publication Settings
                    </h2>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Publication Date
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            className="input input-bordered w-full max-w-xs"
                        />
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/events')}
                        className="btn btn-outline flex-1 sm:flex-none"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-warning flex-1 sm:flex-none"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Creating...
                            </>
                        ) : (
                            <>
                                <FaStar className="mr-2" />
                                Create Success Story
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddSuccessStory;