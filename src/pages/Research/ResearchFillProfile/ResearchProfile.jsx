import { useState, useContext, useEffect } from "react";
import {
  FaEdit,
  FaTimes,
  FaFlask,
  FaBookOpen,
  FaProjectDiagram,
  FaAward,
  FaPlus,
  FaTrash,
  FaFilePdf,
  FaUpload,
  FaDownload,
  FaEye,
  FaGithub,
  FaSpinner,
  FaExternalLinkAlt
} from "react-icons/fa";
import AuthContext from "../../../context/AuthContext";
import axios from "axios";
import ImageUpload from '../../../Components/ImageUpload';
import Swal from 'sweetalert2';

const ResearchProfile = () => {
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(null);
  const [researchData, setResearchData] = useState({
    name: user?.displayName || user?.name || "",
    designation: "",
    department: "",
    email: user?.email || "",
    researchAreas: [],
    bio: "",
    publications: [],
    ongoingProjects: [],
    achievements: [],
    collaborations: [],
    expertise: [],
    totalPublications: 0,
    totalCitations: 0,
    hIndex: 0,
    image: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync metrics with actual publications
  const syncMetricsWithPublications = (data) => {
    const actualPublications = data.publications?.length || 0;
    const actualCitations = data.publications?.reduce((sum, pub) => sum + (parseInt(pub.citations) || 0), 0) || 0;
    
    return {
      ...data,
      totalPublications: actualPublications,
      totalCitations: actualCitations
    };
  };

  // Fetch research data when component mounts
  useEffect(() => {
    if (user?.email) {
      setLoading(true);
      setError(null);
      
      axios.get(`https://dce-server.vercel.app/research-profiles/${user.email}`)
        .then(response => {
          if (response.data) {
            const data = {
              name: response.data.name || user?.displayName || user?.name || "",
              email: response.data.email || user?.email || "",
              designation: response.data.designation || "",
              department: response.data.department || "",
              bio: response.data.bio || "",
              image: response.data.image || "",
              researchAreas: Array.isArray(response.data.researchAreas) ? response.data.researchAreas : [],
              publications: Array.isArray(response.data.publications) ? response.data.publications : [],
              ongoingProjects: Array.isArray(response.data.ongoingProjects) ? response.data.ongoingProjects : [],
              achievements: Array.isArray(response.data.achievements) ? response.data.achievements : [],
              collaborations: Array.isArray(response.data.collaborations) ? response.data.collaborations : [],
              expertise: Array.isArray(response.data.expertise) ? response.data.expertise : [],
              hIndex: parseInt(response.data.hIndex) || 0,
            };
            
            // 🔥 AUTO-FIX: Always sync metrics with actual publications
            const correctedData = syncMetricsWithPublications(data);
            setResearchData(correctedData);
          }
          setLoading(false);
        })
        .catch(error => {
          const defaultData = {
            name: user?.displayName || user?.name || "",
            email: user?.email || "",
            researchAreas: [],
            publications: [],
            ongoingProjects: [],
            achievements: [],
            collaborations: [],
            expertise: [],
            totalPublications: 0,
            totalCitations: 0,
            hIndex: 0
          };
          setResearchData(defaultData);
          setLoading(false);
          if (error.response?.status !== 404) {
            setError('Failed to load research profile data');
          }
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResearchData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Publication handlers
  const addPublication = () => {
    setResearchData(prev => {
      const updatedData = {
        ...prev,
        publications: [...prev.publications, {
          title: "",
          journal: "",
          year: new Date().getFullYear(),
          citations: 0,
          doi: "",
          authors: "",
          pdfUrl: "",
          pdfName: ""
        }]
      };
      // Use the correct function name
      return syncMetricsWithPublications(updatedData);
    });
  };

  const updatePublication = (index, field, value) => {
    setResearchData(prev => {
      const updatedData = {
        ...prev,
        publications: prev.publications.map((pub, i) => 
          i === index ? { ...pub, [field]: value } : pub
        )
      };
      
      // Only recalculate if citations field is being updated
      if (field === 'citations') {
        return syncMetricsWithPublications(updatedData);
      }
      
      return updatedData;
    });
  };

  const removePublication = (index) => {
    Swal.fire({
      title: 'Remove Publication?',
      text: 'Are you sure you want to remove this publication?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setResearchData(prev => {
          const updatedData = {
            ...prev,
            publications: prev.publications.filter((_, i) => i !== index)
          };
          // 🔥 AUTO-FIX: Sync metrics immediately
          return syncMetricsWithPublications(updatedData);
        });
        
        Swal.fire({
          title: 'Removed!',
          text: 'Publication removed and stats updated.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  // PDF upload handler for GitHub
  const handlePdfUpload = async (index, file) => {
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      Swal.fire({
        title: 'Invalid File Type',
        text: 'Please select a PDF file only.',
        icon: 'error'
      });
      return;
    }

    // Validate file size (25MB limit for GitHub)
    if (file.size > 25 * 1024 * 1024) {
      Swal.fire({
        title: 'File Too Large',
        text: 'File size must be less than 25MB.',
        icon: 'error'
      });
      return;
    }

    setUploadingPdf(index);

    // Show uploading progress
    Swal.fire({
      title: 'Uploading PDF to GitHub...',
      html: '<div class="flex items-center justify-center"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('publicationIndex', index);

    try {
      console.log('📤 Starting upload for publication', index);
      
      const response = await axios.post(
        `https://dce-server.vercel.app/research-profiles/${user.email}/upload-publication-pdf`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        // Update the publication with PDF URL and name
        updatePublication(index, 'pdfUrl', response.data.pdfUrl);
        updatePublication(index, 'pdfName', response.data.fileName);
        
        Swal.fire({
          title: 'Success!',
          text: 'PDF uploaded successfully to GitHub!',
          icon: 'success',
          confirmButtonColor: '#10b981'
        });
        
        console.log('✅ Upload successful:', response.data.pdfUrl);
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      Swal.fire({
        title: 'Upload Failed',
        text: `Failed to upload PDF: ${error.response?.data?.message || error.message}`,
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setUploadingPdf(null);
    }
  };

  // Remove PDF from GitHub
  const removePdf = async (index) => {
    if (!researchData.publications[index].pdfUrl) return;
    
    const result = await Swal.fire({
      title: 'Remove PDF?',
      text: 'Are you sure you want to remove this PDF from GitHub?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!'
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: 'Removing PDF...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      await axios.delete(
        `https://dce-server.vercel.app/research-profiles/${user.email}/remove-publication-pdf/${index}`
      );

      updatePublication(index, 'pdfUrl', '');
      updatePublication(index, 'pdfName', '');
      
      Swal.fire({
        title: 'Removed!',
        text: 'PDF removed successfully from GitHub!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('❌ Remove error:', error);
      Swal.fire({
        title: 'Error',
        text: `Failed to remove PDF: ${error.message}`,
        icon: 'error'
      });
    }
  };

  // Project handlers
  const addProject = () => {
    setResearchData(prev => ({
      ...prev,
      ongoingProjects: [...prev.ongoingProjects, {
        title: "",
        description: "",
        status: "In Progress",
        duration: "",
        funding: "",
        collaborators: ""
      }]
    }));
  };

  const updateProject = (index, field, value) => {
    setResearchData(prev => ({
      ...prev,
      ongoingProjects: prev.ongoingProjects.map((project, i) => 
        i === index ? { ...project, [field]: value } : project
      )
    }));
  };

  const removeProject = (index) => {
    Swal.fire({
      title: 'Remove Project?',
      text: 'Are you sure you want to remove this project?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setResearchData(prev => ({
          ...prev,
          ongoingProjects: prev.ongoingProjects.filter((_, i) => i !== index)
        }));
        
        Swal.fire({
          title: 'Removed!',
          text: 'Project has been removed.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  // Achievement handlers
  const addAchievement = () => {
    setResearchData(prev => ({
      ...prev,
      achievements: [...prev.achievements, {
        title: "",
        organization: "",
        year: new Date().getFullYear(),
        description: ""
      }]
    }));
  };

  const updateAchievement = (index, field, value) => {
    setResearchData(prev => ({
      ...prev,
      achievements: prev.achievements.map((achievement, i) => 
        i === index ? { ...achievement, [field]: value } : achievement
      )
    }));
  };

  const removeAchievement = (index) => {
    Swal.fire({
      title: 'Remove Achievement?',
      text: 'Are you sure you want to remove this achievement?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setResearchData(prev => ({
          ...prev,
          achievements: prev.achievements.filter((_, i) => i !== index)
        }));
        
        Swal.fire({
          title: 'Removed!',
          text: 'Achievement has been removed.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!user?.email) {
      Swal.fire({
        title: 'Authentication Error',
        text: 'User email not found. Please login again.',
        icon: 'error'
      });
      return;
    }

    Swal.fire({
      title: 'Saving Research Profile...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // 🔥 AUTO-FIX: Ensure metrics are synced before saving
    const correctedData = syncMetricsWithPublications(researchData);

    const cleanedData = {
      ...correctedData,
      email: user.email,
      publications: correctedData.publications.map(pub => ({
        title: pub.title || '',
        journal: pub.journal || '',
        year: parseInt(pub.year) || new Date().getFullYear(),
        citations: parseInt(pub.citations) || 0,
        authors: pub.authors || '',
        pdfUrl: pub.pdfUrl || '',
        pdfName: pub.pdfName || ''
      })),
      ongoingProjects: correctedData.ongoingProjects.map(project => ({
        title: project.title || '',
        description: project.description || '',
        status: project.status || 'In Progress',
        duration: project.duration || '',
        funding: project.funding || '',
        collaborators: project.collaborators || ''
      })),
      achievements: correctedData.achievements.map(achievement => ({
        title: achievement.title || '',
        organization: achievement.organization || '',
        year: parseInt(achievement.year) || new Date().getFullYear(),
        description: achievement.description || ''
      })),
      researchAreas: Array.isArray(correctedData.researchAreas) ? correctedData.researchAreas : []
    };

    axios.put(`https://dce-server.vercel.app/research-profiles/${user.email}`, cleanedData)
      .then(response => {
        if (response.data.success) {
          setResearchData(cleanedData);
          setIsEditing(false);
          
          Swal.fire({
            title: 'Success!',
            text: 'Research profile updated successfully!',
            icon: 'success',
            confirmButtonColor: '#10b981'
          });
        } else {
          throw new Error(response.data.message || 'Update failed');
        }
      })
      .catch(err => {
        console.error('Update error:', err);
        Swal.fire({
          title: 'Update Failed',
          text: 'Failed to update research profile. Please try again.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      });
  };

  const handleImageUpload = (imageUrl) => {
    setResearchData(prev => ({
      ...prev,
      image: imageUrl
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4 mx-auto" />
          <p className="text-lg text-gray-600">Loading research profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">❌ {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Research Profile</h1>
          <p className="text-gray-600">Showcase your research work and achievements</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-lg shadow p-6">
              {/* Profile Image & Name */}
              <div className="text-center mb-6">
                <div className="mb-6">
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <img
                        src={researchData.image || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp"}
                        alt="Research Profile"
                        className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                      />
                      {user?.email && (
                        <ImageUpload 
                          email={user.email}
                          uploadUrl={`https://dce-server.vercel.app/research-profiles/${user.email}/upload-image`}
                          onImageUpload={handleImageUpload}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Name and Designation */}
                <div className="mb-6 border-b pb-4">
                  <h2 className="text-xl font-semibold">{researchData.name || "Your Name"}</h2>
                  <p className="text-gray-600 mt-1">{researchData.designation || "Add your designation"}</p>
                  <p className="text-gray-500 text-sm">{researchData.department || "Add your department"}</p>

                  {/* Edit Profile Button */}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 w-full flex items-center justify-center gap-2 text-blue-600 border-2 border-blue-600 hover:bg-blue-50 py-2 rounded-md"
                  >
                    <FaEdit /> Edit Research Profile
                  </button>
                </div>

                {/* Research Metrics */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {researchData.publications?.length || researchData.totalPublications || 0}
                      </div>
                      <div className="text-sm text-gray-600">Publications</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {researchData.publications?.reduce((sum, pub) => sum + (parseInt(pub.citations) || 0), 0) || researchData.totalCitations || 0}
                      </div>
                      <div className="text-sm text-gray-600">Citations</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{researchData.hIndex}</div>
                      <div className="text-sm text-gray-600">H-Index</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Research Areas */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <FaFlask className="text-blue-500" />
                  Research Areas
                </h3>
                <div className="space-y-2">
                  {researchData.researchAreas.length > 0 ? (
                    researchData.researchAreas.map((area, index) => (
                      <div key={index} className="bg-blue-50 text-blue-800 text-sm px-3 py-2 rounded-full">
                        {area}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Click &quot;Edit Profile&quot; to add research areas</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="md:w-2/3">
            {/* About Research */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Research Bio</h3>
              <p className="text-gray-600">
                {researchData.bio || "Click 'Edit Profile' to add your research bio and showcase your work."}
              </p>
            </div>

            {/* Publications with GitHub PDF Support */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaBookOpen className="text-gray-600" />
                Recent Publications
                <FaGithub className="text-gray-400 text-sm" title="PDFs stored on GitHub" />
              </h3>
              {researchData.publications.length > 0 ? (
                researchData.publications.map((pub, index) => (
                  <div key={index} className="mb-6 pb-6 border-b last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 flex-1">{pub.title}</h4>
                      {pub.pdfUrl && (
                        <div className="flex gap-2 ml-4">
                          <a
                            href={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pub.pdfUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm px-2 py-1 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                            title="View PDF online"
                          >
                            <FaEye /> View
                          </a>
                          <a
                            href={pub.pdfUrl}
                            download={pub.pdfName || 'research-paper.pdf'}
                            className="text-green-600 hover:text-green-800 flex items-center gap-1 text-sm px-2 py-1 border border-green-300 rounded hover:bg-green-50 transition-colors"
                            title="Download PDF"
                          >
                            <FaDownload /> Download
                          </a>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600">{pub.journal}, {pub.year}</p>
                    {pub.authors && <p className="text-sm text-gray-500">Authors: {pub.authors}</p>}
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-blue-600">{pub.citations} citations</p>
                      {pub.pdfUrl && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <FaFilePdf className="text-red-500" />
                          <FaGithub className="text-gray-600" />
                          <span>PDF Available on GitHub</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No publications added yet. Edit your profile to add publications.</p>
              )}
            </div>

            {/* Ongoing Projects */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaProjectDiagram className="text-gray-600" />
                Ongoing Projects
              </h3>
              {researchData.ongoingProjects.length > 0 ? (
                researchData.ongoingProjects.map((project, index) => (
                  <div key={index} className="mb-4 pb-4 border-b last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{project.title}</h4>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        {project.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">{project.description}</p>
                    <p className="text-sm text-gray-500">Duration: {project.duration}</p>
                    <p className="text-sm text-gray-500">Funding: {project.funding}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No ongoing projects added yet. Edit your profile to add projects.</p>
              )}
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaAward className="text-gray-600" />
                Achievements & Awards
              </h3>
              {researchData.achievements.length > 0 ? (
                researchData.achievements.map((achievement, index) => (
                  <div key={index} className="mb-3 pb-3 border-b last:border-b-0">
                    <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                    <p className="text-gray-600 text-sm">{achievement.organization}, {achievement.year}</p>
                    {achievement.description && <p className="text-gray-500 text-sm mt-1">{achievement.description}</p>}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No achievements added yet. Edit your profile to add achievements.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal with GitHub PDF Upload */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Edit Research Profile</h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div>
                  <h3 className="font-medium mb-4 text-lg border-b pb-2">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={researchData.name}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Designation
                      </label>
                      <input
                        type="text"
                        name="designation"
                        value={researchData.designation}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Professor, Associate Professor, Research Scholar"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={researchData.department}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={researchData.email}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Research Metrics */}
                <div>
                  <h3 className="font-medium mb-4 text-lg border-b pb-2">Research Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Publications
                      </label>
                      <input
                        type="number"
                        name="totalPublications"
                        value={researchData.totalPublications}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Citations
                      </label>
                      <input
                        type="number"
                        name="totalCitations"
                        value={researchData.totalCitations}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        H-Index
                      </label>
                      <input
                        type="number"
                        name="hIndex"
                        value={researchData.hIndex}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Research Bio */}
                <div>
                  <h3 className="font-medium mb-4 text-lg border-b pb-2">Research Bio</h3>
                  <textarea
                    name="bio"
                    rows="4"
                    value={researchData.bio}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your research background and interests..."
                  ></textarea>
                </div>

                {/* Research Areas */}
                <div>
                  <h3 className="font-medium mb-4 text-lg border-b pb-2">Research Areas</h3>
                  <input
                    type="text"
                    value={researchData.researchAreas.join(', ')}
                    onChange={(e) => {
                      const areas = e.target.value.split(',').map(area => area.trim()).filter(area => area);
                      setResearchData(prev => ({
                        ...prev,
                        researchAreas: areas
                      }));
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Artificial Intelligence, Machine Learning, Data Science (comma-separated)"
                  />
                </div>

                {/* Publications Section with GitHub PDF Upload */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-lg border-b pb-2 flex-1 flex items-center gap-2">
                      Publications 
                      <FaGithub className="text-gray-500" title="PDFs stored on GitHub" />
                    </h3>
                    <button
                      type="button"
                      onClick={addPublication}
                      className="ml-4 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 flex items-center gap-2"
                    >
                      <FaPlus /> Add Publication
                    </button>
                  </div>
                  
                  {researchData.publications.map((pub, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4 mb-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-gray-800">Publication {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removePublication(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                          <input
                            type="text"
                            value={pub.title}
                            onChange={(e) => updatePublication(index, 'title', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            placeholder="Publication title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Journal/Conference</label>
                          <input
                            type="text"
                            value={pub.journal}
                            onChange={(e) => updatePublication(index, 'journal', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            placeholder="Journal or conference name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                          <input
                            type="number"
                            value={pub.year}
                            onChange={(e) => updatePublication(index, 'year', parseInt(e.target.value))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Citations</label>
                          <input
                            type="number"
                            value={pub.citations}
                            onChange={(e) => updatePublication(index, 'citations', parseInt(e.target.value))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Authors</label>
                          <input
                            type="text"
                            value={pub.authors || ''}
                            onChange={(e) => updatePublication(index, 'authors', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            placeholder="List of authors"
                          />
                        </div>

                        {/* PDF Upload Section with GitHub Integration */}
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            Research Paper (PDF) 
                            <FaGithub className="text-gray-500" />
                            <span className="text-xs text-gray-500">- Stored on GitHub</span>
                          </label>
                          
                          {pub.pdfUrl ? (
                            // PDF is uploaded
                            <div className="border-2 border-dashed border-green-300 rounded-lg p-4 bg-green-50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <FaFilePdf className="text-red-500 text-2xl" />
                                  <FaGithub className="text-gray-600 text-xl" />
                                  <div>
                                    <p className="font-medium text-gray-800">{pub.pdfName || 'Research Paper'}</p>
                                    <p className="text-sm text-gray-600">✅ Uploaded to GitHub successfully</p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <a
                                    href={pub.pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm px-3 py-1 border border-blue-300 rounded hover:bg-blue-50"
                                  >
                                    <FaExternalLinkAlt /> Open
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => removePdf(index)}
                                    className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm px-3 py-1 border border-red-300 rounded hover:bg-red-50"
                                  >
                                    <FaTrash /> Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            // No PDF uploaded
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                  <FaUpload className="h-8 w-8 text-gray-400" />
                                  <FaGithub className="h-6 w-6 text-gray-400" />
                                </div>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                                  <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors">
                                    <FaFilePdf />
                                    {uploadingPdf === index ? (
                                      <>
                                        <FaSpinner className="animate-spin" />
                                        Uploading to GitHub...
                                      </>
                                    ) : (
                                      'Upload PDF to GitHub'
                                    )}
                                    <input
                                      type="file"
                                      accept=".pdf"
                                      onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                          handlePdfUpload(index, file);
                                        }
                                      }}
                                      className="hidden"
                                      disabled={uploadingPdf === index}
                                    />
                                  </label>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                  📄 PDF files only, max 25MB • 🌐 Publicly accessible on GitHub
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Projects Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-lg border-b pb-2 flex-1">Ongoing Projects</h3>
                    <button
                      type="button"
                      onClick={addProject}
                      className="ml-4 bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 flex items-center gap-2"
                    >
                      <FaPlus /> Add Project
                    </button>
                  </div>
                  
                  {researchData.ongoingProjects.map((project, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4 mb-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-gray-800">Project {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeProject(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                          <input
                            type="text"
                            value={project.title}
                            onChange={(e) => updateProject(index, 'title', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            placeholder="Project title"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            value={project.description}
                            onChange={(e) => updateProject(index, 'description', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            rows="3"
                            placeholder="Project description"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <select
                            value={project.status}
                            onChange={(e) => updateProject(index, 'status', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                          >
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Planning">Planning</option>
                            <option value="On Hold">On Hold</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                          <input
                            type="text"
                            value={project.duration}
                            onChange={(e) => updateProject(index, 'duration', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            placeholder="e.g., 2 years, 6 months"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Funding</label>
                          <input
                            type="text"
                            value={project.funding}
                            onChange={(e) => updateProject(index, 'funding', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            placeholder="Funding source/amount"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Collaborators</label>
                          <input
                            type="text"
                            value={project.collaborators || ''}
                            onChange={(e) => updateProject(index, 'collaborators', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            placeholder="Collaborating institutions/researchers"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Achievements Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-lg border-b pb-2 flex-1">Achievements & Awards</h3>
                    <button
                      type="button"
                      onClick={addAchievement}
                      className="ml-4 bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 flex items-center gap-2"
                    >
                      <FaPlus /> Add Achievement
                    </button>
                  </div>
                  
                  {researchData.achievements.map((achievement, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4 mb-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-gray-800">Achievement {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeAchievement(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                          <input
                            type="text"
                            value={achievement.title}
                            onChange={(e) => updateAchievement(index, 'title', e.target.value)}
                            placeholder="Achievement title"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                          <input
                            type="text"
                            value={achievement.organization}
                            onChange={(e) => updateAchievement(index, 'organization', e.target.value)}
                            placeholder="Organization/Institution"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                          <input
                            type="number"
                            value={achievement.year}
                            onChange={(e) => updateAchievement(index, 'year', e.target.value)}
                            placeholder="Year"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            value={achievement.description}
                            onChange={(e) => updateAchievement(index, 'description', e.target.value)}
                            rows="2"
                            placeholder="Brief description of the achievement"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                  >
                    <FaEdit />
                    Save Research Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchProfile;