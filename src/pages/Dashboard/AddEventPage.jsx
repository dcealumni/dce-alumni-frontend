import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCloudUploadAlt, FaTrash, FaLink } from 'react-icons/fa';
import axios from 'axios';

const AddEventPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        eventType: 'Event', // Default value
        date: '',
        time: '',
        location: '',
        description: '',
        highlights: [''], // Start with one empty highlight
        attendees: '',
        photoLink: '', // New field for Google Drive link
        images: [],
        imageFiles: []
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleHighlightChange = (index, value) => {
        const updatedHighlights = [...formData.highlights];
        updatedHighlights[index] = value;
        setFormData({
            ...formData,
            highlights: updatedHighlights
        });
    };

    const addHighlight = () => {
        setFormData({
            ...formData,
            highlights: [...formData.highlights, '']
        });
    };

    const removeHighlight = (index) => {
        const updatedHighlights = formData.highlights.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            highlights: updatedHighlights
        });
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        
        // Preview images
        const newImagePreviews = files.map(file => URL.createObjectURL(file));
        
        setFormData({
            ...formData,
            images: [...formData.images, ...newImagePreviews],
            imageFiles: [...formData.imageFiles, ...files]
        });
    };

    const removeImage = (index) => {
        const updatedImages = [...formData.images];
        const updatedImageFiles = [...formData.imageFiles];
        
        URL.revokeObjectURL(updatedImages[index]); // Clean up object URL
        updatedImages.splice(index, 1);
        updatedImageFiles.splice(index, 1);
        
        setFormData({
            ...formData,
            images: updatedImages,
            imageFiles: updatedImageFiles
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Create form data for multipart/form-data submission
            const data = new FormData();
            
            // Add text fields
            data.append('title', formData.title);
            data.append('eventType', formData.eventType);
            data.append('date', formData.date);
            data.append('time', formData.time);
            data.append('location', formData.location);
            data.append('description', formData.description);
            data.append('attendees', formData.attendees);
            data.append('photoLink', formData.photoLink); // Add the Google Drive link
            
            // Add arrays as JSON strings
            data.append('highlights', JSON.stringify(formData.highlights.filter(h => h.trim())));
            
            // Add images
            formData.imageFiles.forEach(file => {
                data.append('images', file);
            });
            
            const response = await axios.post('https://dce-server.vercel.app/events', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (response.status === 201) {
                navigate('/dashboard/events');
            }
        } catch (error) {
            console.error('Error creating event:', error);
            alert('Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    const validateDriveLink = (link) => {
        // Basic validation to ensure it's a Google Drive link
        if (!link) return true; // Empty links are valid (optional field)
        return link.includes('drive.google.com') || link.includes('photos.google.com');
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
                <button 
                    onClick={() => navigate('/dashboard/events')} 
                    className="btn btn-ghost btn-sm"
                >
                    <FaArrowLeft />
                </button>
                <h2 className="text-xl font-bold ml-2">Add New Event</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Event Title</span>
                        </label>
                        <input 
                            type="text" 
                            name="title" 
                            value={formData.title} 
                            onChange={handleChange}
                            className="input input-bordered" 
                            placeholder="Annual Alumni Meet 2024" 
                            required
                        />
                    </div>
                    
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Event Type</span>
                        </label>
                        <select 
                            name="eventType" 
                            value={formData.eventType} 
                            onChange={handleChange}
                            className="select select-bordered w-full"
                        >
                            <option value="Event">Event</option>
                            <option value="News">News</option>
                            <option value="Seminar">Seminar</option>
                            <option value="Workshop">Workshop</option>
                            <option value="Meeting">Meeting</option>
                        </select>
                    </div>
                    
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Date</span>
                        </label>
                        <input 
                            type="date" 
                            name="date" 
                            value={formData.date} 
                            onChange={handleChange}
                            className="input input-bordered" 
                            required
                        />
                    </div>
                    
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Time</span>
                        </label>
                        <input 
                            type="time" 
                            name="time" 
                            value={formData.time} 
                            onChange={handleChange}
                            className="input input-bordered" 
                        />
                    </div>
                    
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Location</span>
                        </label>
                        <input 
                            type="text" 
                            name="location" 
                            value={formData.location} 
                            onChange={handleChange}
                            className="input input-bordered" 
                            placeholder="DCE Campus Auditorium"
                        />
                    </div>
                    
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Number of Attendees</span>
                        </label>
                        <input 
                            type="number" 
                            name="attendees" 
                            value={formData.attendees} 
                            onChange={handleChange}
                            className="input input-bordered" 
                            placeholder="150"
                        />
                    </div>
                </div>
                
                {/* Description */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Event Description</span>
                    </label>
                    <textarea 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange}
                        className="textarea textarea-bordered h-24" 
                        placeholder="Describe the event details..."
                        required
                    ></textarea>
                </div>
                
                {/* Photo Link Field */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">
                            Google Drive Photo Album Link 
                            <span className="text-xs text-gray-500 ml-1">(optional)</span>
                        </span>
                    </label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                            <FaLink className="text-gray-500" />
                        </span>
                        <input 
                            type="url" 
                            name="photoLink" 
                            value={formData.photoLink} 
                            onChange={handleChange}
                            className={`input input-bordered flex-1 rounded-l-none ${
                                formData.photoLink && !validateDriveLink(formData.photoLink) ? 
                                'input-error' : ''
                            }`} 
                            placeholder="https://drive.google.com/drive/folders/..."
                        />
                    </div>
                    {formData.photoLink && !validateDriveLink(formData.photoLink) && (
                        <label className="label">
                            <span className="label-text-alt text-error">
                                Please enter a valid Google Drive or Photos link
                            </span>
                        </label>
                    )}
                    <label className="label">
                        <span className="label-text-alt">
                            Share high-resolution photos through Google Drive for participants to download
                        </span>
                    </label>
                </div>
                
                {/* Event Highlights */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Event Highlights</label>
                        <button 
                            type="button" 
                            onClick={addHighlight}
                            className="btn btn-sm btn-outline"
                        >
                            Add Highlight
                        </button>
                    </div>
                    
                    {formData.highlights.map((highlight, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <input 
                                type="text" 
                                value={highlight} 
                                onChange={(e) => handleHighlightChange(index, e.target.value)}
                                className="input input-bordered flex-1" 
                                placeholder="Keynote address by Dr. Rajesh Kumar"
                            />
                            <button 
                                type="button" 
                                onClick={() => removeHighlight(index)}
                                className="btn btn-sm btn-circle btn-outline btn-error"
                                disabled={formData.highlights.length <= 1}
                            >
                                <FaTrash />
                            </button>
                        </div>
                    ))}
                </div>
                
                {/* Image Upload Section */}
                <div className="space-y-3">
                    <label className="text-sm font-medium">Event Images</label>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <input 
                            type="file" 
                            id="event-images" 
                            onChange={handleImageUpload}
                            className="hidden" 
                            multiple
                            accept="image/*"
                        />
                        <label 
                            htmlFor="event-images" 
                            className="flex flex-col items-center justify-center cursor-pointer"
                        >
                            <FaCloudUploadAlt size={32} className="text-gray-400 mb-2" />
                            <span className="text-gray-600">Click to upload event images</span>
                            <span className="text-gray-400 text-sm mt-1">(You can select multiple images)</span>
                        </label>
                    </div>
                    
                    {/* Image Previews */}
                    {formData.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            {formData.images.map((image, index) => (
                                <div key={index} className="relative">
                                    <img 
                                        src={image} 
                                        alt={`Preview ${index + 1}`}
                                        className="h-32 w-full object-cover rounded-lg"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Form Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                    <button 
                        type="button" 
                        className="btn btn-outline"
                        onClick={() => navigate('/dashboard/events')}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={loading || (formData.photoLink && !validateDriveLink(formData.photoLink))}
                    >
                        {loading ? (
                            <>
                                <span className="loading loading-spinner loading-xs"></span>
                                Saving...
                            </>
                        ) : (
                            'Create Event'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddEventPage;
