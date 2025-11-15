import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaCloudUploadAlt } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2'; // Import SweetAlert

const EditCommitteeMember = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '', position: '', batch: '', session: '',
        description: '', phone: '', email: '', image: null
    });

    useEffect(() => {
        const fetchCommitteeMember = async () => {
            try {
                setFetchLoading(true);
                const response = await axios.get(`https://dce-server.vercel.app/committees/${id}`);
                console.log("API Response:", response.data); // Log to see the structure
                
                // Handle different API response structures
                let memberData;
                if (response.data && response.data.member) {
                    memberData = response.data.member;
                } else if (response.data && response.data.data) {
                    memberData = response.data.data;
                } else {
                    memberData = response.data;
                }
                
                console.log("Member Data:", memberData); // Log the extracted member data
                
                setFormData({
                    name: memberData.name || '',
                    position: memberData.position || '',
                    batch: memberData.batch || '',
                    session: memberData.session || '',
                    description: memberData.description || '',
                    phone: memberData.phone || '',
                    email: memberData.email || '',
                    imagePreview: memberData.image || null
                });
            } catch (error) {
                console.error('Error fetching committee member:', error);
                
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to load committee member data',
                    icon: 'error'
                });
            } finally {
                setFetchLoading(false);
            }
        };

        if (id) {
            fetchCommitteeMember();
        }
    }, [id]);

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
                } else if (key !== 'imagePreview') {
                    data.append(key, formData[key]);
                }
            });

            const response = await axios.put(`https://dce-server.vercel.app/committees/${id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.status === 200) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Committee member updated successfully',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    navigate('/dashboard/committee');
                });
            }
        } catch (error) {
            console.error('Error updating committee member:', error);
            
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update committee member',
                icon: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // Ask for confirmation if form has been modified
        const isDirty = formData.name || formData.position || formData.batch || 
                       formData.session || formData.description || 
                       formData.phone || formData.email || formData.image;
        
        if (isDirty) {
            Swal.fire({
                title: 'Discard changes?',
                text: 'You have unsaved changes. Are you sure you want to leave?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, discard',
                cancelButtonText: 'No, continue editing'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/dashboard/committee');
                }
            });
        } else {
            navigate('/dashboard/committee');
        }
    };

    if (fetchLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
                <button onClick={() => navigate('/dashboard/committee')} className="btn btn-ghost btn-sm">
                    <FaArrowLeft />
                </button>
                <h2 className="text-xl font-bold ml-2">Edit Committee Member</h2>
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
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-sm btn-primary"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="loading loading-spinner loading-xs mr-1"></span>
                                Saving...
                            </>
                        ) : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditCommitteeMember;