import React, { useState, useEffect } from 'react';
import { Plus, Wrench, CheckCircle2, AlertCircle, LogOut, Bike as BikeIcon, DollarSign, Zap, Image as ImageIcon, Copy } from 'lucide-react';

// Pre-built maintenance templates for common bikes
const MAINTENANCE_TEMPLATES = {
  harley: {
    name: 'Harley-Davidson',
    tasks: [
      { task: 'Oil & Filter Change', mileageInterval: 5000, estimatedCost: 75 },
      { task: 'Air Filter Inspection', mileageInterval: 10000, estimatedCost: 0 },
      { task: 'Tire Rotation', mileageInterval: 8000, estimatedCost: 40 },
      { task: 'Chain Adjustment & Lube', mileageInterval: 1000, estimatedCost: 0 },
      { task: 'Spark Plug Replacement', mileageInterval: 10000, estimatedCost: 60 },
      { task: 'Brake Fluid Check', mileageInterval: 6000, estimatedCost: 0 },
      { task: 'Transmission Fluid Change', mileageInterval: 10000, estimatedCost: 150 },
    ]
  },
  yamaha: {
    name: 'Yamaha',
    tasks: [
      { task: 'Oil & Filter Change', mileageInterval: 4000, estimatedCost: 65 },
      { task: 'Air Filter', mileageInterval: 12000, estimatedCost: 35 },
      { task: 'Tire Balance & Rotation', mileageInterval: 6000, estimatedCost: 50 },
      { task: 'Chain Maintenance', mileageInterval: 500, estimatedCost: 0 },
      { task: 'Coolant Flush', mileageInterval: 20000, estimatedCost: 80 },
    ]
  },
  honda: {
    name: 'Honda',
    tasks: [
      { task: 'Oil & Filter Change', mileageInterval: 4000, estimatedCost: 60 },
      { task: 'Air Filter', mileageInterval: 8000, estimatedCost: 30 },
      { task: 'Tire Service', mileageInterval: 6000, estimatedCost: 45 },
      { task: 'Brake Inspection', mileageInterval: 8000, estimatedCost: 0 },
    ]
  },
};

function GarageApp() {
  const [view, setView] = useState('auth'); // auth, dashboard, bike-detail
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bikes, setBikes] = useState([]);
  const [selectedBike, setSelectedBike] = useState(null);
  const [showAddBike, setShowAddBike] = useState(false);
  const [showAddMaintenance, setShowAddMaintenance] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showUpdateMileage, setShowUpdateMileage] = useState(false);
  const [bikeName, setBikeName] = useState('');
  const [bikeYear, setBikeYear] = useState('');
  const [bikeModel, setBikeModel] = useState('');
  const [bikeMileage, setBikeMileage] = useState('');
  const [maintenanceTask, setMaintenanceTask] = useState('');
  const [maintenanceDueDate, setMaintenanceDueDate] = useState('');
  const [maintenanceDueMileage, setMaintenanceDueMileage] = useState('');
  const [maintenanceNotes, setMaintenanceNotes] = useState('');
  const [maintenancePartsCost, setMaintenancePartsCost] = useState('');
  const [maintenanceLaborCost, setMaintenanceLaborCost] = useState('');
  const [maintenancePhoto, setMaintenancePhoto] = useState('');
  const [currentMileageInput, setCurrentMileageInput] = useState('');

  // Simulate auth with localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('garage-user');
    const savedBikes = localStorage.getItem('garage-bikes');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      if (savedBikes) setBikes(JSON.parse(savedBikes));
      setView('dashboard');
    }
  }, []);

  // Handle signup/login
  const handleAuth = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    const newUser = { id: Date.now(), email, name: email.split('@')[0] };
    setUser(newUser);
    localStorage.setItem('garage-user', JSON.stringify(newUser));
    localStorage.setItem('garage-bikes', JSON.stringify([]));
    setBikes([]);
    setEmail('');
    setPassword('');
    setView('dashboard');
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    setBikes([]);
    setSelectedBike(null);
    localStorage.removeItem('garage-user');
    localStorage.removeItem('garage-bikes');
    setView('auth');
  };

  // Add new bike
  const handleAddBike = (e) => {
    e.preventDefault();
    if (!bikeName || !bikeYear || !bikeModel || !bikeMileage) return;
    
    const newBike = {
      id: Date.now(),
      name: bikeName,
      year: bikeYear,
      model: bikeModel,
      currentMileage: parseInt(bikeMileage),
      maintenance: []
    };
    
    const updatedBikes = [...bikes, newBike];
    setBikes(updatedBikes);
    localStorage.setItem('garage-bikes', JSON.stringify(updatedBikes));
    setBikeName('');
    setBikeYear('');
    setBikeModel('');
    setBikeMileage('');
    setShowAddBike(false);
  };

  // Update bike mileage
  const handleUpdateMileage = (e) => {
    e.preventDefault();
    if (!currentMileageInput) return;
    
    const updatedBikes = bikes.map(bike => {
      if (bike.id === selectedBike.id) {
        return {
          ...bike,
          currentMileage: parseInt(currentMileageInput)
        };
      }
      return bike;
    });
    
    setBikes(updatedBikes);
    localStorage.setItem('garage-bikes', JSON.stringify(updatedBikes));
    setSelectedBike(updatedBikes.find(b => b.id === selectedBike.id));
    setCurrentMileageInput('');
    setShowUpdateMileage(false);
  };

  // Add maintenance task
  const handleAddMaintenance = (e) => {
    e.preventDefault();
    if (!maintenanceTask) return;
    
    const updatedBikes = bikes.map(bike => {
      if (bike.id === selectedBike.id) {
        return {
          ...bike,
          maintenance: [...bike.maintenance, {
            id: Date.now(),
            task: maintenanceTask,
            dueDate: maintenanceDueDate || null,
            dueMileage: maintenanceDueMileage ? parseInt(maintenanceDueMileage) : null,
            notes: maintenanceNotes,
            partsCost: maintenancePartsCost ? parseFloat(maintenancePartsCost) : 0,
            laborCost: maintenanceLaborCost ? parseFloat(maintenanceLaborCost) : 0,
            photo: maintenancePhoto,
            completed: false,
            completedDate: null,
            completedMileage: null
          }]
        };
      }
      return bike;
    });
    
    setBikes(updatedBikes);
    localStorage.setItem('garage-bikes', JSON.stringify(updatedBikes));
    setSelectedBike(updatedBikes.find(b => b.id === selectedBike.id));
    setMaintenanceTask('');
    setMaintenanceDueDate('');
    setMaintenanceDueMileage('');
    setMaintenanceNotes('');
    setMaintenancePartsCost('');
    setMaintenanceLaborCost('');
    setMaintenancePhoto('');
    setShowAddMaintenance(false);
  };

  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setMaintenancePhoto(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Apply maintenance template
  const applyTemplate = (templateKey) => {
    const template = MAINTENANCE_TEMPLATES[templateKey];
    const currentMileage = selectedBike.currentMileage;
    
    const newTasks = template.tasks.map(t => ({
      id: Date.now() + Math.random(),
      task: t.task,
      dueDate: null,
      dueMileage: currentMileage + t.mileageInterval,
      notes: '',
      partsCost: t.estimatedCost,
      laborCost: 0,
      photo: null,
      completed: false,
      completedDate: null,
      completedMileage: null
    }));
    
    const updatedBikes = bikes.map(bike => {
      if (bike.id === selectedBike.id) {
        return {
          ...bike,
          maintenance: [...bike.maintenance, ...newTasks]
        };
      }
      return bike;
    });
    
    setBikes(updatedBikes);
    localStorage.setItem('garage-bikes', JSON.stringify(updatedBikes));
    setSelectedBike(updatedBikes.find(b => b.id === selectedBike.id));
    setShowTemplates(false);
  };

  // Mark maintenance as complete
  const toggleMaintenanceComplete = (bikeId, maintenanceId) => {
    const updatedBikes = bikes.map(bike => {
      if (bike.id === bikeId) {
        return {
          ...bike,
          maintenance: bike.maintenance.map(m => {
            if (m.id === maintenanceId) {
              return {
                ...m,
                completed: !m.completed,
                completedDate: !m.completed ? new Date().toISOString().split('T')[0] : null,
                completedMileage: !m.completed ? selectedBike.currentMileage : null
              };
            }
            return m;
          })
        };
      }
      return bike;
    });
    
    setBikes(updatedBikes);
    localStorage.setItem('garage-bikes', JSON.stringify(updatedBikes));
    if (selectedBike) {
      setSelectedBike(updatedBikes.find(b => b.id === selectedBike.id));
    }
  };

  // Delete maintenance task
  const deleteMaintenanceTask = (bikeId, maintenanceId) => {
    const updatedBikes = bikes.map(bike => {
      if (bike.id === bikeId) {
        return {
          ...bike,
          maintenance: bike.maintenance.filter(m => m.id !== maintenanceId)
        };
      }
      return bike;
    });
    
    setBikes(updatedBikes);
    localStorage.setItem('garage-bikes', JSON.stringify(updatedBikes));
    if (selectedBike) {
      setSelectedBike(updatedBikes.find(b => b.id === selectedBike.id));
    }
  };

  // Delete bike
  const deleteBike = (bikeId) => {
    const updatedBikes = bikes.filter(b => b.id !== bikeId);
    setBikes(updatedBikes);
    localStorage.setItem('garage-bikes', JSON.stringify(updatedBikes));
    setSelectedBike(null);
  };

  // Calculate total cost for a task
  const getTotalCost = (task) => {
    return (task.partsCost || 0) + (task.laborCost || 0);
  };

  // Get upcoming maintenance count
  const getUpcomingCount = (bike) => {
    return bike.maintenance.filter(m => {
      if (m.completed) return false;
      const now = new Date();
      const dueDate = m.dueDate ? new Date(m.dueDate) : null;
      const dueMileage = m.dueMileage;
      
      return (dueDate && dueDate >= now) || (dueMileage && dueMileage >= bike.currentMileage);
    }).length;
  };

  // Check if maintenance is due
  const isMaintenanceDue = (task, bike) => {
    if (task.completed) return false;
    
    const now = new Date();
    const dueDatePassed = task.dueDate && new Date(task.dueDate) < now;
    const dueMileagePassed = task.dueMileage && bike.currentMileage >= task.dueMileage;
    
    return dueDatePassed || dueMileagePassed;
  };

  // Sort maintenance by due status
  const sortMaintenance = (maintenance, bike) => {
    return [...maintenance].sort((a, b) => {
      const aDue = a.dueMileage ? (a.dueMileage - bike.currentMileage) : 999999;
      const bDue = b.dueMileage ? (b.dueMileage - bike.currentMileage) : 999999;
      return aDue - bDue;
    });
  };

  // AUTH VIEW
  if (view === 'auth') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 shadow-2xl">
            <div className="flex items-center justify-center mb-8">
              <BikeIcon className="w-12 h-12 text-gray-300 mr-3" />
              <h1 className="text-3xl font-bold text-white">Garage 43</h1>
            </div>
            <p className="text-gray-500 text-center mb-8 text-sm">Manage your motorcycle maintenance schedule</p>
            
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Sign In / Sign Up
              </button>
            </form>
            
            <p className="text-gray-600 text-xs text-center mt-6">Demo: Use any email and password to get started</p>
          </div>
        </div>
      </div>
    );
  }

  // DASHBOARD VIEW
  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-black">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-800 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <BikeIcon className="w-8 h-8 text-gray-300 mr-3" />
              <h1 className="text-2xl font-bold text-white">Garage 43</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-500 text-sm">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">My Garage</h2>
            <button
              onClick={() => setShowAddBike(true)}
              className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded font-semibold transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Bike</span>
            </button>
          </div>

          {/* Add Bike Modal */}
          {showAddBike && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 w-full max-w-md">
                <h3 className="text-2xl font-bold text-white mb-6">Add New Bike</h3>
                <form onSubmit={handleAddBike} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Bike Name</label>
                    <input
                      type="text"
                      value={bikeName}
                      onChange={(e) => setBikeName(e.target.value)}
                      placeholder="e.g., Road King"
                      className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Year</label>
                      <input
                        type="number"
                        value={bikeYear}
                        onChange={(e) => setBikeYear(e.target.value)}
                        placeholder="2023"
                        className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Model</label>
                      <input
                        type="text"
                        value={bikeModel}
                        onChange={(e) => setBikeModel(e.target.value)}
                        placeholder="FLHRI"
                        className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Current Mileage</label>
                    <input
                      type="number"
                      value={bikeMileage}
                      onChange={(e) => setBikeMileage(e.target.value)}
                      placeholder="0"
                      className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                    />
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      type="submit"
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
                    >
                      Create Bike
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddBike(false)}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold py-2 px-4 rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Bikes Grid */}
          {bikes.length === 0 ? (
            <div className="text-center py-16">
              <BikeIcon className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-6">No bikes yet. Add your first bike to get started.</p>
              <button
                onClick={() => setShowAddBike(true)}
                className="inline-flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded font-semibold transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Bike</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bikes.map(bike => {
                const upcomingCount = getUpcomingCount(bike);
                const totalCost = bike.maintenance
                  .filter(m => m.completed)
                  .reduce((sum, m) => sum + getTotalCost(m), 0);
                
                return (
                  <div
                    key={bike.id}
                    onClick={() => {
                      setSelectedBike(bike);
                      setView('bike-detail');
                    }}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">{bike.year} {bike.name}</h3>
                        <p className="text-gray-500 text-sm">{bike.model}</p>
                      </div>
                      <BikeIcon className="w-8 h-8 text-gray-300 group-hover:text-gray-200" />
                    </div>
                    
                    <div className="bg-gray-800 rounded px-3 py-2 mb-4">
                      <p className="text-gray-400 text-sm font-semibold">{bike.currentMileage.toLocaleString()} mi</p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                      <div>
                        {upcomingCount > 0 ? (
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-yellow-400" />
                            <span className="text-yellow-400 text-sm font-medium">{upcomingCount} due</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 text-sm font-medium">All current</span>
                          </div>
                        )}
                      </div>
                      <span className="text-gray-600 text-xs">${totalCost.toFixed(0)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // BIKE DETAIL VIEW
  if (view === 'bike-detail' && selectedBike) {
    const upcomingMaintenance = sortMaintenance(
      selectedBike.maintenance.filter(m => !m.completed),
      selectedBike
    );
    const completedMaintenance = sortMaintenance(
      selectedBike.maintenance.filter(m => m.completed),
      selectedBike
    );
    
    const totalSpent = selectedBike.maintenance
      .filter(m => m.completed)
      .reduce((sum, m) => sum + getTotalCost(m), 0);

    return (
      <div className="min-h-screen bg-black">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-800 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <button
              onClick={() => {
                setView('dashboard');
                setSelectedBike(null);
              }}
              className="flex items-center space-x-2 text-gray-500 hover:text-white transition-colors mb-4"
            >
              <span>← Back to Garage</span>
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">{selectedBike.year} {selectedBike.name}</h1>
                <p className="text-gray-500">{selectedBike.model}</p>
              </div>
              <button
                onClick={() => {
                  deleteBike(selectedBike.id);
                  setView('dashboard');
                  setSelectedBike(null);
                }}
                className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
              >
                Delete Bike
              </button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-gray-900 border-b border-gray-800 px-4 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-500 text-sm mb-1">Current Mileage</p>
                <div className="flex items-end justify-between">
                  <p className="text-white font-bold text-2xl">{selectedBike.currentMileage.toLocaleString()}</p>
                  <button
                    onClick={() => {
                      setCurrentMileageInput(selectedBike.currentMileage.toString());
                      setShowUpdateMileage(true);
                    }}
                    className="text-gray-300 hover:text-gray-200 text-xs font-semibold"
                  >
                    Update
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-500 text-sm mb-1">Maintenance Due</p>
                <p className="text-yellow-400 font-bold text-2xl">{upcomingMaintenance.length}</p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-500 text-sm mb-1">Total Maintenance Cost</p>
                <p className="text-green-400 font-bold text-2xl">${totalSpent.toFixed(0)}</p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-500 text-sm mb-1">Total Tasks</p>
                <p className="text-gray-300 font-bold text-2xl">{selectedBike.maintenance.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Update Mileage Modal */}
        {showUpdateMileage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 w-full max-w-md">
              <h3 className="text-2xl font-bold text-white mb-6">Update Mileage</h3>
              <form onSubmit={handleUpdateMileage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Current Mileage</label>
                  <input
                    type="number"
                    value={currentMileageInput}
                    onChange={(e) => setCurrentMileageInput(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-gray-600"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUpdateMileage(false)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold py-2 px-4 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Templates Modal */}
        {showTemplates && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 w-full max-w-md">
              <h3 className="text-2xl font-bold text-white mb-6">Load Maintenance Template</h3>
              <p className="text-gray-500 text-sm mb-6">Select a template to add pre-built maintenance schedules</p>
              <div className="space-y-3">
                {Object.entries(MAINTENANCE_TEMPLATES).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => applyTemplate(key)}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white text-left px-4 py-3 rounded transition-colors"
                  >
                    <p className="font-semibold">{template.name}</p>
                    <p className="text-gray-500 text-sm">{template.tasks.length} tasks</p>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowTemplates(false)}
                className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold py-2 px-4 rounded transition-colors mt-4"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Maintenance Schedule</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTemplates(true)}
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded font-semibold transition-colors text-sm"
              >
                <Copy className="w-4 h-4" />
                <span>Load Template</span>
              </button>
              <button
                onClick={() => setShowAddMaintenance(true)}
                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded font-semibold transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Task</span>
              </button>
            </div>
          </div>

          {/* Add Maintenance Modal */}
          {showAddMaintenance && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 w-full max-w-2xl my-8">
                <h3 className="text-2xl font-bold text-white mb-6">Add Maintenance Task</h3>
                <form onSubmit={handleAddMaintenance} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Task</label>
                    <input
                      type="text"
                      value={maintenanceTask}
                      onChange={(e) => setMaintenanceTask(e.target.value)}
                      placeholder="e.g., Oil change"
                      className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Due Date (optional)</label>
                      <input
                        type="date"
                        value={maintenanceDueDate}
                        onChange={(e) => setMaintenanceDueDate(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Due Mileage (optional)</label>
                      <input
                        type="number"
                        value={maintenanceDueMileage}
                        onChange={(e) => setMaintenanceDueMileage(e.target.value)}
                        placeholder="e.g., 5000"
                        className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Parts Cost</label>
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-2">$</span>
                        <input
                          type="number"
                          value={maintenancePartsCost}
                          onChange={(e) => setMaintenancePartsCost(e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Labor Cost</label>
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-2">$</span>
                        <input
                          type="number"
                          value={maintenanceLaborCost}
                          onChange={(e) => setMaintenanceLaborCost(e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Notes</label>
                    <textarea
                      value={maintenanceNotes}
                      onChange={(e) => setMaintenanceNotes(e.target.value)}
                      placeholder="Technician notes, parts used, etc."
                      className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 resize-none"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Photo (optional)</label>
                    <div className="flex items-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600"
                      />
                    </div>
                    {maintenancePhoto && (
                      <div className="mt-3 rounded overflow-hidden bg-gray-800 p-2">
                        <img src={maintenancePhoto} alt="preview" className="w-full h-40 object-cover rounded" />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="submit"
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
                    >
                      Add Task
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddMaintenance(false);
                        setMaintenancePhoto('');
                      }}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold py-2 px-4 rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Upcoming Maintenance */}
          <div className="mb-12">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <span>Maintenance Due ({upcomingMaintenance.length})</span>
            </h3>
            
            {upcomingMaintenance.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-500">No pending maintenance tasks</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingMaintenance.map(task => {
                  const isDue = isMaintenanceDue(task, selectedBike);
                  const mileageUntilDue = task.dueMileage ? task.dueMileage - selectedBike.currentMileage : null;
                  
                  return (
                    <div
                      key={task.id}
                      className={`bg-gray-900 border rounded-lg p-4 ${
                        isDue ? 'border-red-500 bg-red-950 bg-opacity-30' : 'border-gray-800'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-white font-semibold mb-2">{task.task}</h4>
                          
                          {/* Due info */}
                          <div className="flex flex-wrap gap-3 mb-2">
                            {task.dueMileage && (
                              <div className={`text-sm ${isDue ? 'text-red-400' : 'text-gray-500'}`}>
                                <span className="font-semibold">Mileage:</span> {task.dueMileage.toLocaleString()} mi
                                {mileageUntilDue && (
                                  <span className={mileageUntilDue < 0 ? 'text-red-400 ml-2' : 'text-gray-600 ml-2'}>
                                    ({mileageUntilDue > 0 ? '+' : ''}{mileageUntilDue.toLocaleString()} mi)
                                  </span>
                                )}
                              </div>
                            )}
                            {task.dueDate && (
                              <div className={`text-sm ${isDue ? 'text-red-400' : 'text-gray-500'}`}>
                                <span className="font-semibold">Date:</span> {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>

                          {/* Cost info */}
                          {getTotalCost(task) > 0 && (
                            <div className="text-sm text-gray-500 mb-2">
                              <DollarSign className="w-4 h-4 inline mr-1" />
                              {task.partsCost > 0 && <span>Parts: ${task.partsCost.toFixed(2)} </span>}
                              {task.laborCost > 0 && <span>Labor: ${task.laborCost.toFixed(2)} </span>}
                              <span className="font-semibold">Total: ${getTotalCost(task).toFixed(2)}</span>
                            </div>
                          )}

                          {/* Notes and photos */}
                          {task.notes && <p className="text-gray-500 text-sm mb-2">{task.notes}</p>}
                          {task.photo && (
                            <img src={task.photo} alt={task.task} className="w-full h-32 object-cover rounded mt-2 mb-2" />
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => toggleMaintenanceComplete(selectedBike.id, task.id)}
                            className="text-gray-500 hover:text-green-400 transition-colors"
                            title="Mark complete"
                          >
                            <CheckCircle2 className="w-6 h-6" />
                          </button>
                          <button
                            onClick={() => deleteMaintenanceTask(selectedBike.id, task.id)}
                            className="text-gray-500 hover:text-red-400 transition-colors"
                            title="Delete task"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Completed Maintenance */}
          {completedMaintenance.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Service History ({completedMaintenance.length})</span>
              </h3>
              
              <div className="space-y-3">
                {completedMaintenance.map(task => (
                  <div
                    key={task.id}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-4 opacity-85"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-gray-400 font-semibold mb-2">{task.task}</h4>
                        
                        <div className="flex flex-wrap gap-3 mb-2">
                          <div className="text-sm text-gray-600">
                            <span className="font-semibold">Completed:</span> {new Date(task.completedDate).toLocaleDateString()}
                          </div>
                          {task.completedMileage && (
                            <div className="text-sm text-gray-600">
                              <span className="font-semibold">Mileage:</span> {task.completedMileage.toLocaleString()} mi
                            </div>
                          )}
                        </div>

                        {getTotalCost(task) > 0 && (
                          <div className="text-sm text-gray-600 mb-2">
                            <DollarSign className="w-4 h-4 inline mr-1" />
                            ${getTotalCost(task).toFixed(2)}
                          </div>
                        )}

                        {task.notes && <p className="text-gray-700 text-sm mb-2">{task.notes}</p>}
                        {task.photo && (
                          <img src={task.photo} alt={task.task} className="w-full h-32 object-cover rounded mt-2" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => toggleMaintenanceComplete(selectedBike.id, task.id)}
                          className="text-gray-700 hover:text-yellow-400 transition-colors"
                          title="Mark incomplete"
                        >
                          <CheckCircle2 className="w-6 h-6" />
                        </button>
                        <button
                          onClick={() => deleteMaintenanceTask(selectedBike.id, task.id)}
                          className="text-gray-700 hover:text-red-400 transition-colors"
                          title="Delete task"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default GarageApp;
