import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

// Use environment variable or fallback to production server
// Vite uses import.meta.env instead of process.env
const API_URL = import.meta.env.VITE_API_URL || 'https://dce-server.vercel.app';

const Research = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedResearcher, setSelectedResearcher] = useState(null);
  const [researchers, setResearchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alumniStatus, setAlumniStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);

  // Get Firebase user from AuthContext
  const { user } = useContext(AuthContext);

  // Check if user is a verified alumni member using the alumni registration endpoint
  useEffect(() => {
    const checkAlumniStatus = async () => {
      if (!user || !user.emailVerified) {
        setStatusLoading(false);
        return;
      }

      try {
        let alumniRecord = null;
        
        // First try by UID
        try {
          const uidResponse = await axios.get(`${API_URL}/alumni-registration/check-by-uid/${user.uid}`);
          if (uidResponse.data.hasSubmitted && uidResponse.data.submission) {
            alumniRecord = uidResponse.data.submission;
          }
        } catch {
          // If UID check fails, try by getting all and matching email
          try {
            const allResponse = await axios.get(`${API_URL}/alumni-registration/all`);
            if (allResponse.data.success && allResponse.data.alumni) {
              alumniRecord = allResponse.data.alumni.find(alumni => 
                alumni.email === user.email || alumni.userEmail === user.email
              );
            }
          } catch (allError) {
            console.error('Error fetching all alumni:', allError);
          }
        }
        
        // Process the found record
        if (alumniRecord) {
          // Check for approved status (backend uses 'accepted' + approval: true)
          if (alumniRecord.status === 'accepted' && alumniRecord.approval === true) {
            setAlumniStatus('approved');
          } else if (alumniRecord.status === 'pending' || (!alumniRecord.approval && alumniRecord.status !== 'rejected')) {
            setAlumniStatus('pending');
          } else if (alumniRecord.status === 'rejected') {
            setAlumniStatus('rejected');
          } else {
            setAlumniStatus('pending');
          }
        } else {
          setAlumniStatus('not_registered');
        }
        
      } catch (error) {
        console.error('Error checking alumni status:', error);
        setAlumniStatus('error');
      } finally {
        setStatusLoading(false);
      }
    };

    checkAlumniStatus();
  }, [user]);

  // Check if user is a verified alumni member
  const isVerifiedAlumni = () => {
    return user && user.emailVerified && alumniStatus === 'approved';
  };

  // Add this function at the top of your Research component (around line 20):
  const correctResearcherStats = (researcher) => {
    const actualPublications = researcher.publications?.length || 0;
    const actualCitations = researcher.publications?.reduce((sum, pub) => sum + (parseInt(pub.citations) || 0), 0) || 0;
    
    return {
      ...researcher,
      totalPublications: actualPublications,
      totalCitations: actualCitations
    };
  };

  // Fetch researchers
  useEffect(() => {
    const fetchResearchers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/research-profiles`);
        
        if (response.data.success) {
          // Filter to show only profiles with meaningful research content
          // This prevents auto-created empty profiles from showing
          const validProfiles = response.data.profiles.filter(profile => {
            const hasName = profile.name && profile.name.trim() !== '';
            const hasResearchAreas = profile.researchAreas && profile.researchAreas.length > 0;
            const hasPublications = profile.publications && profile.publications.length > 0;
            const hasBio = profile.bio && profile.bio.trim() !== '';
            const hasProjects = profile.ongoingProjects && profile.ongoingProjects.length > 0;
            
            // Only show if profile has name AND at least one research-related field
            return hasName && (hasResearchAreas || hasPublications || hasBio || hasProjects);
          });
          setResearchers(validProfiles);
        } else {
          setError('Failed to load research profiles');
        }
      } catch (error) {
        console.error('Error fetching research profiles:', error);
        setError('Error loading research profiles');
      } finally {
        setLoading(false);
      }
    };

    fetchResearchers();
  }, []);

  // Update the researchers state to fix stats when data loads (around line 80):
  useEffect(() => {
    if (activeSection === 'profiles') {
      setLoading(true);
      setError(null);
      
      axios.get(`${API_URL}/research-profiles`)
        .then(response => {
          console.log('Research profiles response:', response.data);
          
          if (response.data && response.data.profiles) {
            // 🔥 FIX: Correct all researcher stats
            const correctedProfiles = response.data.profiles.map(researcher => 
              correctResearcherStats(researcher)
            );
            
            setResearchers(correctedProfiles);
          } else {
            setResearchers([]);
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching research profiles:', error);
          setError('Failed to load research profiles');
          setLoading(false);
        });
    }
  }, [activeSection]);

  // Calculate dynamic stats based on real data
  const calculateStats = () => {
    const totalResearchers = researchers.length;
    
    // Calculate from actual publications array, not totalPublications field
    const totalPublications = researchers.reduce((sum, researcher) => {
      if (researcher.publications && Array.isArray(researcher.publications)) {
        return sum + researcher.publications.length;
      }
      return sum + (researcher.totalPublications || 0);
    }, 0);
    
    // Calculate from actual publications citations
    const totalCitations = researchers.reduce((sum, researcher) => {
      if (researcher.publications && Array.isArray(researcher.publications)) {
        const researcherCitations = researcher.publications.reduce((citSum, pub) => 
          citSum + (parseInt(pub.citations) || 0), 0
        );
        return sum + researcherCitations;
      }
      return sum + (researcher.totalCitations || 0);
    }, 0);
    
    const allAreas = researchers.flatMap(r => r.researchAreas || []);
    const uniqueAreas = [...new Set(allAreas)];

    return {
      researchers: totalResearchers,
      publications: totalPublications,
      citations: totalCitations,
      researchAreas: uniqueAreas.length
    };
  };

  const stats = calculateStats();

  const getResearchAreaStats = () => {
    const areaStats = {};
    
    researchers.forEach(researcher => {
      if (researcher.researchAreas) {
        researcher.researchAreas.forEach(area => {
          if (areaStats[area]) {
            areaStats[area]++;
          } else {
            areaStats[area] = 1;
          }
        });
      }
    });

    return Object.entries(areaStats)
      .map(([area, count]) => ({ title: area, researchers: count }))
      .sort((a, b) => b.researchers - a.researchers)
      .slice(0, 6);
  };

  const topResearchAreas = getResearchAreaStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Research & Innovation</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover our research community and their contributions to knowledge
          </p>

          {/* Show status messages */}
          {!statusLoading && user && user.emailVerified && !isVerifiedAlumni() && (
            <div className="text-center">
              {alumniStatus === 'pending' && (
                <p className="text-yellow-600 bg-yellow-50 p-3 rounded-lg inline-block">
                  Your alumni registration is pending approval.
                </p>
              )}
              {alumniStatus === 'not_registered' && (
                <div className="text-gray-600">
                  <p className="mb-3">Research profiles are available to verified alumni members.</p>
                  <Link 
                    to="/profile"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Complete Your Profile & Register as Alumni
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-lg p-2 flex space-x-2">
            <button
              onClick={() => {
                setActiveSection('overview');
                setSelectedResearcher(null);
              }}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeSection === 'overview'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Research Overview
            </button>
            <button
              onClick={() => setActiveSection('profiles')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeSection === 'profiles'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Researcher Profiles ({researchers.length})
            </button>
            <button
              onClick={() => setActiveSection('facilities')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeSection === 'facilities'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Lab Facilities
            </button>
          </div>
        </div>

        {/* Research Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-8">
            {/* Dynamic Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl mb-2">👨‍🔬</div>
                <div className="text-3xl font-bold text-blue-600 mb-1">{stats.researchers}</div>
                <div className="text-gray-600">Active Researchers</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl mb-2">📄</div>
                <div className="text-3xl font-bold text-green-600 mb-1">{stats.publications}</div>
                <div className="text-gray-600">Research Papers</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl mb-2">📊</div>
                <div className="text-3xl font-bold text-purple-600 mb-1">{stats.citations}</div>
                <div className="text-gray-600">Total Citations</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl mb-2">🔬</div>
                <div className="text-3xl font-bold text-orange-600 mb-1">{stats.researchAreas}</div>
                <div className="text-gray-600">Research Areas</div>
              </div>
            </div>

            {/* Dynamic Research Areas Overview */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Top Research Focus Areas</h2>
              {topResearchAreas.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topResearchAreas.map((area, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-2">{area.title}</h3>
                      <span className="text-sm text-blue-600">
                        {area.researchers} Researcher{area.researchers !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No research areas defined yet.</p>
                  <p className="text-sm mt-2">Researchers can add their areas of expertise in their profiles.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Researcher Profiles Section */}
        {activeSection === 'profiles' && !selectedResearcher && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Our Research Community</h2>
              <p className="text-gray-600 mb-8">Meet our dedicated researchers and explore their work</p>
            </div>

            {loading && (
              <div className="text-center py-8">
                <div className="text-lg text-gray-600">Loading research profiles...</div>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <div className="text-lg text-red-600">{error}</div>
              </div>
            )}

            {!loading && !error && researchers.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <div className="text-6xl mb-4">🔬</div>
                <h3 className="text-xl font-semibold mb-2">No Research Profiles Yet</h3>
                <p className="text-gray-600 mb-2">Be the first to create a research profile and showcase your work!</p>
                <p className="text-sm text-gray-500 mt-4">
                  Visit your profile page to join our research community.
                </p>
              </div>
            )}

            {!loading && !error && researchers.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {researchers.map((researcher, index) => (
                  <div key={researcher._id || index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <img 
                          src={researcher.image || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp"} 
                          alt={researcher.name}
                          className="w-16 h-16 rounded-full mr-4 object-cover"
                        />
                        <div>
                          <h3 className="font-bold text-lg">{researcher.name}</h3>
                          <p className="text-gray-600 text-sm">{researcher.designation || 'Researcher'}</p>
                          <p className="text-gray-500 text-sm">{researcher.department || 'DCE'}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Research Areas:</h4>
                        <div className="flex flex-wrap gap-1">
                          {researcher.researchAreas && researcher.researchAreas.length > 0 ? (
                            <>
                              {researcher.researchAreas.slice(0, 2).map((area, areaIndex) => (
                                <span key={areaIndex} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {area}
                                </span>
                              ))}
                              {researcher.researchAreas.length > 2 && (
                                <span className="text-xs text-gray-500">+{researcher.researchAreas.length - 2} more</span>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-gray-500">No research areas specified</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                        <div>
                          {/* 🔥 FIX: Show corrected publication count */}
                          <div className="font-bold text-blue-600">{researcher.publications?.length || 0}</div>
                          <div className="text-xs text-gray-600">Publications</div>
                        </div>
                        <div>
                          {/* 🔥 FIX: Show corrected citation count */}
                          <div className="font-bold text-green-600">
                            {researcher.publications?.reduce((sum, pub) => sum + (parseInt(pub.citations) || 0), 0) || 0}
                          </div>
                          <div className="text-xs text-gray-600">Citations</div>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedResearcher(correctResearcherStats(researcher))}
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Individual Researcher Profile */}
        {selectedResearcher && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header with Edit Button */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center">
                    <img 
                      src={selectedResearcher.image || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp"} 
                      alt={selectedResearcher.name}
                      className="w-20 h-20 rounded-full mr-4 object-cover"
                    />
                    <div>
                      <h2 className="text-2xl font-bold">{selectedResearcher.name}</h2>
                      <p className="text-gray-600">{selectedResearcher.designation}</p>
                      <p className="text-gray-500">{selectedResearcher.department}</p>
                      <p className="text-blue-600">{selectedResearcher.email}</p>
                      
                      {/* 🔥 ADD: Edit Profile Button (only for own profile) */}
                      {user && user.email === selectedResearcher.email && isVerifiedAlumni() && (
                        <Link 
                          to="/research-profile"
                          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mt-3 text-sm"
                        >
                          <span>✏️</span>
                          Edit My Profile
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedResearcher(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Bio */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">Bio:</h3>
                  <p className="text-gray-600">{selectedResearcher.bio || "No bio available"}</p>
                </div>

                {/* Stats - CORRECTED */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    {/* 🔥 FIX: Show actual publication count */}
                    <div className="text-3xl font-bold text-blue-600">{selectedResearcher.publications?.length || 0}</div>
                    <div className="text-gray-600">Publications</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    {/* 🔥 FIX: Show actual citation count */}
                    <div className="text-3xl font-bold text-green-600">
                      {selectedResearcher.publications?.reduce((sum, pub) => sum + (parseInt(pub.citations) || 0), 0) || 0}
                    </div>
                    <div className="text-gray-600">Citations</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">{selectedResearcher.hIndex || 0}</div>
                    <div className="text-gray-600">H-Index</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Research Areas */}
                  <div>
                    <h3 className="text-xl font-bold mb-4">Research Areas</h3>
                    <div className="space-y-2">
                      {selectedResearcher.researchAreas && selectedResearcher.researchAreas.length > 0 ? (
                        selectedResearcher.researchAreas.map((area, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg">
                            {area}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No research areas specified</p>
                      )}
                    </div>
                  </div>

                  {/* Recent Publications */}
                  <div>
                    <h3 className="text-xl font-bold mb-4">Recent Publications</h3>
                    <div className="space-y-3">
                      {selectedResearcher.publications && selectedResearcher.publications.length > 0 ? (
                        selectedResearcher.publications.slice(0, 3).map((pub, index) => (
                          <div key={index} className="border border-gray-200 p-3 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium">{pub.title}</h4>
                                <p className="text-sm text-gray-600">{pub.journal}, {pub.year}</p>
                                {pub.authors && <p className="text-sm text-gray-500">Authors: {pub.authors}</p>}
                                <p className="text-sm text-blue-600">{pub.citations || 0} citations</p>
                              </div>
                              
                              {/* PDF Buttons - Show if PDF exists */}
                              {pub.pdfUrl && (
                                <div className="flex gap-2 ml-4">
                                  <a
                                    href={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pub.pdfUrl)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm px-3 py-1 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                                    title="View PDF online"
                                  >
                                    👁️ View
                                  </a>
                                  <a
                                    href={pub.pdfUrl}
                                    download={pub.pdfName || 'research-paper.pdf'}
                                    className="text-green-600 hover:text-green-800 flex items-center gap-1 text-sm px-3 py-1 border border-green-300 rounded hover:bg-green-50 transition-colors"
                                    title="Download PDF"
                                  >
                                    📥 Download
                                  </a>
                                </div>
                              )}
                            </div>
                            
                            {/* PDF Available Indicator */}
                            {pub.pdfUrl && (
                              <div className="flex items-center gap-2 text-sm text-green-600 mt-2">
                                <span>📄</span>
                                <span>🐙</span>
                                <span>PDF Available on GitHub</span>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No publications added yet</p>
                      )}
                    </div>
                  </div>

                  {/* Ongoing Projects */}
                  <div className="md:col-span-2">
                    <h3 className="text-xl font-bold mb-4">Ongoing Projects</h3>
                    <div className="space-y-3">
                      {selectedResearcher.ongoingProjects && selectedResearcher.ongoingProjects.length > 0 ? (
                        selectedResearcher.ongoingProjects.map((project, index) => (
                          <div key={index} className="border border-gray-200 p-4 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold">{project.title}</h4>
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                {project.status}
                              </span>
                            </div>
                            {project.description && <p className="text-sm text-gray-600 mb-2">{project.description}</p>}
                            {project.duration && <p className="text-sm text-gray-600">Duration: {project.duration}</p>}
                            {project.funding && <p className="text-sm text-gray-600">Funding: {project.funding}</p>}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No ongoing projects listed</p>
                      )}
                    </div>
                  </div>

                  {/* Achievements */}
                  {selectedResearcher.achievements && selectedResearcher.achievements.length > 0 && (
                    <div className="md:col-span-2">
                      <h3 className="text-xl font-bold mb-4">Achievements & Awards</h3>
                      <div className="space-y-3">
                        {selectedResearcher.achievements.map((achievement, index) => (
                          <div key={index} className="border border-gray-200 p-4 rounded-lg">
                            <h4 className="font-semibold">{achievement.title}</h4>
                            <p className="text-sm text-gray-600">{achievement.organization}, {achievement.year}</p>
                            {achievement.description && <p className="text-sm text-gray-500 mt-1">{achievement.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lab Facilities Section - Keep as is */}
        {activeSection === 'facilities' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Lab Facilities</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Chemical Analysis Lab', desc: 'HPLC, GC-MS, FTIR', icon: '🧪' },
                { name: 'Dyeing Lab', desc: 'Industrial dyeing equipment', icon: '🎨' },
                { name: 'Textile Testing', desc: 'Quality control equipment', icon: '🔬' },
                { name: 'Research Library', desc: 'Technical journals & databases', icon: '📚' }
              ].map((equipment, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="text-2xl mb-2">{equipment.icon}</div>
                  <h4 className="font-semibold">{equipment.name}</h4>
                  <p className="text-sm text-gray-600">{equipment.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Research;