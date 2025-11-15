import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCloudUploadAlt } from 'react-icons/fa';
import axios from 'axios';

const AddCommitteeMember = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '', position: '', batch: '', session: '',
        description: '', phone: '', email: '', image: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setFormData(prev => ({
                    ...prev,
                    imagePreview: e.target.result,
                    image: file
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            // Append all form fields to FormData
            Object.keys(formData).forEach(key => {
                if (key === 'image') {
                    if (formData.image) {
                        data.append('image', formData.image);
                    }
                } else {
                    data.append(key, formData[key]);
                }
            });

            const response = await axios.post('https://dce-server.vercel.app/committees', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.status === 201) {
                navigate('/dashboard/committee');
            }
        } catch (error) {
            console.error('Error adding committee member:', error);
            // You might want to add error handling UI here
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
                <button onClick={() => navigate('/dashboard/committee')} className="btn btn-ghost btn-sm">
                    <FaArrowLeft />
                </button>
                <h2 className="text-xl font-bold ml-2">Add Committee Member</h2>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Image Upload - Left Column */}
                <div className="space-y-3 flex flex-col items-center justify-center p-4 border rounded-lg">
                    <div className="w-28 h-28 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                        {formData.imagePreview ? (
                            <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <FaCloudUploadAlt className="text-3xl text-gray-400" />
                        )}
                    </div>
                    <input type="file" name="image" onChange={handleImageChange} 
                        className="file-input file-input-bordered file-input-sm w-full max-w-xs" accept="image/*" />
                </div>

                {/* Form Fields - Middle and Right Columns */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="form-control">
                        <input type="text" name="name" value={formData.name} onChange={handleChange}
                            className="input input-bordered input-sm" placeholder="Full Name" />
                    </div>

                    <div className="form-control">
                        <select name="position" value={formData.position} onChange={handleChange}
                            className="select select-bordered select-sm">
                            <option value="">Select Position</option>
                            <option value="President">President</option>
                            <option value="Vice President">Vice President</option>
                            <option value="Secretary">Secretary</option>
                            <option value="Treasurer">Treasurer</option>
                            <option value="Member">Member</option>
                        </select>
                    </div>

                    <div className="form-control">
                        <input type="text" name="batch" value={formData.batch} onChange={handleChange}
                            className="input input-bordered input-sm" placeholder="Batch (e.g., 2019)" />
                    </div>

                    <div className="form-control">
                        <input type="text" name="session" value={formData.session} onChange={handleChange}
                            className="input input-bordered input-sm" placeholder="Session (e.g., 2019-2023)" />
                    </div>

                    <div className="form-control">
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                            className="input input-bordered input-sm" placeholder="Phone Number" />
                    </div>

                    <div className="form-control">
                        <input type="email" name="email" value={formData.email} onChange={handleChange}
                            className="input input-bordered input-sm" placeholder="Email Address" />
                    </div>

                    <div className="md:col-span-2">
                        <textarea name="description" value={formData.description} onChange={handleChange}
                            className="textarea textarea-bordered w-full h-20 text-sm" 
                            placeholder="Brief description about the committee member" />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="md:col-span-3 flex justify-end gap-2 mt-4">
                    <button 
                        type="button" 
                        className="btn btn-sm btn-outline"
                        onClick={() => navigate('/dashboard/committee')}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-sm btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddCommitteeMember;