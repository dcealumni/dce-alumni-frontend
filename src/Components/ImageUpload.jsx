import { useState } from 'react';
import axios from 'axios';
import { FaEdit } from 'react-icons/fa';

const ImageUpload = ({ email, onImageUpload }) => {
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (event) => {
    try {
      setLoading(true);
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}upload-image/${email}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        onImageUpload(response.data.image);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label
        htmlFor="profile-image"
        className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700"
      >
        <FaEdit className="w-4 h-4" />
        <input
          type="file"
          id="profile-image"
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={loading}
        />
      </label>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
          <div className="text-white text-sm">Uploading...</div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;