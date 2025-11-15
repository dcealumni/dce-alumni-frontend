import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaTimes, FaClock, FaImage, FaCalendarAlt, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import Swal from 'sweetalert2';

const AddUpcomingEventPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [highlights, setHighlights] = useState(['']);

    const [eventData, setEventData] = useState({
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
        attendees: '',
        photoLink: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEventData(prev => ({
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
        
        if (!eventData.title.trim()) {
            Swal.fire({
                title: 'Missing Title',
                text: 'Please enter an event title.',
                icon: 'warning'
            });
            return;
        }

        if (!eventData.date) {
            Swal.fire({
                title: 'Missing Date',
                text: 'Please select a date for the event.',
                icon: 'warning'
            });
            return;
        }

        // Validate that the date is in the future
        const selectedDate = new Date(eventData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            Swal.fire({
                title: 'Invalid Date',
                text: 'Upcoming events must be scheduled for a future date.',
                icon: 'warning'
            });
            return;
        }

        setLoading(true);

        // Show uploading progress
        Swal.fire({
            title: 'Creating Upcoming Event...',
            html: 'Uploading images and saving event...',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const formData = new FormData();
            
            // Add basic event data
            formData.append('title', eventData.title);
            formData.append('date', eventData.date);
            formData.append('time', eventData.time);
            formData.append('location', eventData.location);
            formData.append('description', eventData.description);
            formData.append('attendees', eventData.attendees);
            formData.append('photoLink', eventData.photoLink);
            
            // Add highlights
            const validHighlights = highlights.filter(h => h.trim() !== '');
            formData.append('highlights', JSON.stringify(validHighlights));
            
            // Add images
            selectedImages.forEach(image => {
                formData.append('images', image);
            });

            // 🔥 UPDATED: Use your specific upcoming events endpoint
            const response = await axios.post('https://dce-server.vercel.app/events/upcoming', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                Swal.fire({
                    title: 'Success! 🎉',
                    text: 'Upcoming event created successfully!',
                    icon: 'success',
                    confirmButtonColor: '#8b5cf6'
                }).then(() => {
                    navigate('/dashboard/events');
                });
            } else {
                throw new Error(response.data.message || 'Failed to create upcoming event');
            }
        } catch (error) {
            console.error('Error creating upcoming event:', error);
            Swal.fire({
                title: 'Error!',
                text: `Failed to create upcoming event: ${error.response?.data?.message || error.message}`,
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
                    <FaClock className="text-2xl text-purple-600" />
                    <h1 className="text-2xl font-bold">Add Upcoming Event</h1>
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
                        {/* Event Title */}
                        <div className="lg:col-span-2">
                            <label className="label">
                                <span className="label-text font-medium">Event Title *</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={eventData.title}
                                onChange={handleInputChange}
                                className="input input-bordered w-full"
                                placeholder="Enter upcoming event title..."
                                required
                            />
                        </div>

                        {/* Date */}
                        <div>
                            <label className="label">
                                <span className="label-text font-medium flex items-center gap-2">
                                    <FaCalendarAlt className="text-purple-500" />
                                    Event Date * (Future date only)
                                </span>
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={eventData.date}
                                onChange={handleInputChange}
                                className="input input-bordered w-full"
                                min={new Date().toISOString().split('T')[0]} // Prevent past dates
                                required
                            />
                        </div>

                        {/* Time */}
                        <div>
                            <label className="label">
                                <span className="label-text font-medium flex items-center gap-2">
                                    <FaClock className="text-purple-500" />
                                    Event Time
                                </span>
                            </label>
                            <input
                                type="time"
                                name="time"
                                value={eventData.time}
                                onChange={handleInputChange}
                                className="input input-bordered w-full"
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="label">
                                <span className="label-text font-medium flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-purple-500" />
                                    Event Location
                                </span>
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={eventData.location}
                                onChange={handleInputChange}
                                className="input input-bordered w-full"
                                placeholder="Enter event location..."
                            />
                        </div>

                        {/* Expected Attendees */}
                        <div>
                            <label className="label">
                                <span className="label-text font-medium flex items-center gap-2">
                                    <FaUsers className="text-purple-500" />
                                    Expected Attendees
                                </span>
                            </label>
                            <input
                                type="number"
                                name="attendees"
                                value={eventData.attendees}
                                onChange={handleInputChange}
                                className="input input-bordered w-full"
                                placeholder="Number of expected attendees..."
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Event Description</span>
                        </label>
                        <textarea
                            name="description"
                            value={eventData.description}
                            onChange={handleInputChange}
                            className="textarea textarea-bordered w-full h-32"
                            placeholder="Describe the upcoming event, agenda, speakers, etc..."
                        ></textarea>
                    </div>

                    {/* Highlights */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Event Highlights</span>
                        </label>
                        <div className="space-y-2">
                            {highlights.map((highlight, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={highlight}
                                        onChange={(e) => updateHighlight(index, e.target.value)}
                                        className="input input-bordered flex-1"
                                        placeholder={`Highlight ${index + 1} (e.g., "Keynote Speaker", "Networking Session")...`}
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

                    {/* Event Images */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium flex items-center gap-2">
                                <FaImage className="text-purple-500" />
                                Event Promotional Images (Max 10, 10MB each)
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
                            Upload promotional images, event posters, venue photos, etc.
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

                    {/* Photo Link */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Additional Resources Link</span>
                        </label>
                        <input
                            type="url"
                            name="photoLink"
                            value={eventData.photoLink}
                            onChange={handleInputChange}
                            className="input input-bordered w-full"
                            placeholder="https://drive.google.com/... (event resources, registration link, etc.)"
                        />
                        <div className="text-sm text-gray-500 mt-1">
                            Link to event registration, Google Drive folder, or additional resources
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary flex-1"
                            style={{ backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Creating Event...
                                </>
                            ) : (
                                <>
                                    <FaClock className="mr-2" />
                                    Create Upcoming Event
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
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <FaClock className="text-purple-600 mt-1" />
                    <div>
                        <h4 className="font-medium text-purple-800">Upcoming Event Guidelines</h4>
                        <ul className="text-sm text-purple-700 mt-2 space-y-1">
                            <li>• Events must be scheduled for future dates</li>
                            <li>• Include clear event description and highlights</li>
                            <li>• Add promotional images to attract attendees</li>
                            <li>• Provide registration or resource links if available</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddUpcomingEventPage;