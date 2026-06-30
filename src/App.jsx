import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, AlertCircle, LogOut, Bike as BikeIcon, DollarSign, Copy, Warehouse, ChevronRight, Users, KeyRound, Trash2 } from 'lucide-react';
import { supabase } from './supabaseClient';

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
  // view: auth, garages, garage-detail, bike-detail
  const [view, setView] = useState('auth');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState('signin'); // signin or signup
  const [authError, setAuthError] = useState('');

  const [garages, setGarages] = useState([]);
  const [selectedGarage, setSelectedGarage] = useState(null);
  const [garageMembers, setGarageMembers] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [selectedBike, setSelectedBike] = useState(null);
  const [maintenanceTasks, setMaintenanceTasks] = useState([]);

  const [loading, setLoading] = useState(false);

  // Modals
  const [showAddGarage, setShowAddGarage] = useState(false);
  const [showJoinGarage, setShowJoinGarage] = useState(false);
  const [showAddBike, setShowAddBike] = useState(false);
  const [showAddMaintenance, setShowAddMaintenance] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showUpdateMileage, setShowUpdateMileage] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  // Form fields
  const [garageName, setGarageName] = useState('');
  const [garageLocation, setGarageLocation] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
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

  // ============================
  // AUTH
  // ============================
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (session?.user) {
        setView('garages');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setView('garages');
      } else {
        setView('auth');
        setGarages([]);
        setSelectedGarage(null);
        setSelectedBike(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && view === 'garages') {
      fetchGarages();
    }
  }, [user, view]);

  useEffect(() => {
    if (selectedGarage && view === 'garage-detail') {
      fetchBikes(selectedGarage.id);
      fetchMembers(selectedGarage.id);
    }
  }, [selectedGarage, view]);

  useEffect(() => {
    if (selectedBike && view === 'bike-detail') {
      fetchMaintenance(selectedBike.id);
    }
  }, [selectedBike, view]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!email || !password) return;

    setLoading(true);
    if (authMode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setAuthError(error.message);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
    }
    setLoading(false);
    setEmail('');
    setPassword('');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // ============================
  // GARAGES
  // ============================
  const fetchGarages = async () => {
    setLoading(true);
    const { data: memberships, error: memErr } = await supabase
      .from('garage_members')
      .select('garage_id, role')
      .eq('user_id', user.id);

    if (memErr || !memberships || memberships.length === 0) {
      setGarages([]);
      setLoading(false);
      return;
    }

    const garageIds = memberships.map(m => m.garage_id);
    const { data: garagesData } = await supabase
      .from('garages')
      .select('*')
      .in('id', garageIds);

    // attach bike counts and upcoming maintenance counts
    const enriched = await Promise.all((garagesData || []).map(async (g) => {
      const { data: bikesData } = await supabase
        .from('bikes')
        .select('id, current_mileage')
        .eq('garage_id', g.id);

      let upcomingCount = 0;
      if (bikesData && bikesData.length > 0) {
        const bikeIds = bikesData.map(b => b.id);
        const { data: tasksData } = await supabase
          .from('maintenance_tasks')
          .select('id, bike_id, due_date, due_mileage, completed')
          .in('bike_id', bikeIds)
          .eq('completed', false);

        if (tasksData) {
          const now = new Date();
          upcomingCount = tasksData.filter(t => {
            const bike = bikesData.find(b => b.id === t.bike_id);
            const dueDate = t.due_date ? new Date(t.due_date) : null;
            const dueMileageOk = t.due_mileage && bike && t.due_mileage >= bike.current_mileage;
            return (dueDate && dueDate >= now) || dueMileageOk;
          }).length;
        }
      }

      const myMembership = memberships.find(m => m.garage_id === g.id);
      return { ...g, bikeCount: bikesData?.length || 0, upcomingCount, myRole: myMembership?.role };
    }));

    setGarages(enriched);
    setLoading(false);
  };

  const handleAddGarage = async (e) => {
    e.preventDefault();
    if (!garageName) return;
    setLoading(true);

    const { error } = await supabase
      .from('garages')
      .insert({ name: garageName, location: garageLocation, owner_id: user.id });

    setLoading(false);
    if (error) {
      alert('Error creating garage: ' + error.message);
      return;
    }

    setGarageName('');
    setGarageLocation('');
    setShowAddGarage(false);
    fetchGarages();
  };

  const handleJoinGarage = async (e) => {
    e.preventDefault();
    setJoinError('');
    if (!joinCode) return;
    setLoading(true);

    const { data: garage, error: lookupErr } = await supabase
      .from('garages')
      .select('id')
      .eq('invite_code', joinCode.trim().toLowerCase())
      .maybeSingle();

    if (lookupErr || !garage) {
      setJoinError('No garage found with that invite code.');
      setLoading(false);
      return;
    }

    const { error: joinErr } = await supabase
      .from('garage_members')
      .insert({ garage_id: garage.id, user_id: user.id, role: 'member' });

    setLoading(false);

    if (joinErr) {
      if (joinErr.code === '23505') {
        setJoinError("You're already a member of this garage.");
      } else {
        setJoinError('Error joining garage: ' + joinErr.message);
      }
      return;
    }

    setJoinCode('');
    setShowJoinGarage(false);
    fetchGarages();
  };

  const deleteGarage = async (garageId) => {
    if (!confirm('Delete this garage and all its bikes? This cannot be undone.')) return;
    setLoading(true);
    const { error } = await supabase.from('garages').delete().eq('id', garageId);
    setLoading(false);
    if (error) {
      alert('Error deleting garage: ' + error.message);
      return;
    }
    setSelectedGarage(null);
    setView('garages');
    fetchGarages();
  };

  const fetchMembers = async (garageId) => {
    const { data } = await supabase
      .from('garage_members')
      .select('id, user_id, role, joined_at, profiles(email, display_name)')
      .eq('garage_id', garageId);
    setGarageMembers(data || []);
  };

  const removeMember = async (membershipId) => {
    if (!confirm('Remove this member from the garage?')) return;
    const { error } = await supabase.from('garage_members').delete().eq('id', membershipId);
    if (error) {
      alert('Error removing member: ' + error.message);
      return;
    }
    fetchMembers(selectedGarage.id);
  };

  const leaveGarage = async () => {
    if (!confirm('Leave this garage?')) return;
    const myMembership = garageMembers.find(m => m.user_id === user.id);
    if (!myMembership) return;
    const { error } = await supabase.from('garage_members').delete().eq('id', myMembership.id);
    if (error) {
      alert('Error leaving garage: ' + error.message);
      return;
    }
    setSelectedGarage(null);
    setView('garages');
    fetchGarages();
  };

  // ============================
  // BIKES
  // ============================
  const fetchBikes = async (garageId) => {
    setLoading(true);
    const { data } = await supabase
      .from('bikes')
      .select('*, maintenance_tasks(id, completed, due_date, due_mileage)')
      .eq('garage_id', garageId);
    setBikes(data || []);
    setLoading(false);
  };

  const handleAddBike = async (e) => {
    e.preventDefault();
    if (!bikeName || !bikeYear || !bikeModel || !bikeMileage) return;
    setLoading(true);

    const { error } = await supabase.from('bikes').insert({
      garage_id: selectedGarage.id,
      name: bikeName,
      year: bikeYear,
      model: bikeModel,
      current_mileage: parseInt(bikeMileage),
      added_by: user.id
    });

    setLoading(false);
    if (error) {
      alert('Error adding bike: ' + error.message);
      return;
    }

    setBikeName('');
    setBikeYear('');
    setBikeModel('');
    setBikeMileage('');
    setShowAddBike(false);
    fetchBikes(selectedGarage.id);
  };

  const handleUpdateMileage = async (e) => {
    e.preventDefault();
    if (!currentMileageInput) return;
    setLoading(true);

    const { error } = await supabase
      .from('bikes')
      .update({ current_mileage: parseInt(currentMileageInput) })
      .eq('id', selectedBike.id);

    setLoading(false);
    if (error) {
      alert('Error updating mileage: ' + error.message);
      return;
    }

    setSelectedBike({ ...selectedBike, current_mileage: parseInt(currentMileageInput) });
    setCurrentMileageInput('');
    setShowUpdateMileage(false);
  };

  const deleteBike = async (bikeId) => {
    if (!confirm('Delete this bike and all its maintenance history? This cannot be undone.')) return;
    setLoading(true);
    const { error } = await supabase.from('bikes').delete().eq('id', bikeId);
    setLoading(false);
    if (error) {
      alert('Error deleting bike: ' + error.message);
      return;
    }
    setSelectedBike(null);
    setView('garage-detail');
    fetchBikes(selectedGarage.id);
  };

  // ============================
  // MAINTENANCE
  // ============================
  const fetchMaintenance = async (bikeId) => {
    setLoading(true);
    const { data } = await supabase
      .from('maintenance_tasks')
      .select('*')
      .eq('bike_id', bikeId)
      .order('created_at', { ascending: false });
    setMaintenanceTasks(data || []);
    setLoading(false);
  };

  const handleAddMaintenance = async (e) => {
    e.preventDefault();
    if (!maintenanceTask) return;
    setLoading(true);

    const { error } = await supabase.from('maintenance_tasks').insert({
      bike_id: selectedBike.id,
      task: maintenanceTask,
      due_date: maintenanceDueDate || null,
      due_mileage: maintenanceDueMileage ? parseInt(maintenanceDueMileage) : null,
      notes: maintenanceNotes,
      parts_cost: maintenancePartsCost ? parseFloat(maintenancePartsCost) : 0,
      labor_cost: maintenanceLaborCost ? parseFloat(maintenanceLaborCost) : 0,
      photo_url: maintenancePhoto || null,
      completed: false
    });

    setLoading(false);
    if (error) {
      alert('Error adding task: ' + error.message);
      return;
    }

    setMaintenanceTask('');
    setMaintenanceDueDate('');
    setMaintenanceDueMileage('');
    setMaintenanceNotes('');
    setMaintenancePartsCost('');
    setMaintenanceLaborCost('');
    setMaintenancePhoto('');
    setShowAddMaintenance(false);
    fetchMaintenance(selectedBike.id);
  };

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

  const applyTemplate = async (templateKey) => {
    const template = MAINTENANCE_TEMPLATES[templateKey];
    const currentMileage = selectedBike.current_mileage;
    setLoading(true);

    const newTasks = template.tasks.map(t => ({
      bike_id: selectedBike.id,
      task: t.task,
      due_mileage: currentMileage + t.mileageInterval,
      parts_cost: t.estimatedCost,
      labor_cost: 0,
      completed: false
    }));

    const { error } = await supabase.from('maintenance_tasks').insert(newTasks);

    setLoading(false);
    if (error) {
      alert('Error applying template: ' + error.message);
      return;
    }

    setShowTemplates(false);
    fetchMaintenance(selectedBike.id);
  };

  const toggleMaintenanceComplete = async (task) => {
    const newCompleted = !task.completed;
    const { error } = await supabase
      .from('maintenance_tasks')
      .update({
        completed: newCompleted,
        completed_date: newCompleted ? new Date().toISOString().split('T')[0] : null,
        completed_mileage: newCompleted ? selectedBike.current_mileage : null
      })
      .eq('id', task.id);

    if (error) {
      alert('Error updating task: ' + error.message);
      return;
    }
    fetchMaintenance(selectedBike.id);
  };

  const deleteMaintenanceTask = async (taskId) => {
    if (!confirm('Delete this maintenance task?')) return;
    const { error } = await supabase.from('maintenance_tasks').delete().eq('id', taskId);
    if (error) {
      alert('Error deleting task: ' + error.message);
      return;
    }
    fetchMaintenance(selectedBike.id);
  };

  // ============================
  // HELPERS
  // ============================
  const getTotalCost = (task) => (parseFloat(task.parts_cost) || 0) + (parseFloat(task.labor_cost) || 0);

  const getBikeUpcomingCount = (bike) => {
    const tasks = bike.maintenance_tasks || [];
    const now = new Date();
    return tasks.filter(t => {
      if (t.completed) return false;
      const dueDate = t.due_date ? new Date(t.due_date) : null;
      const dueMileageOk = t.due_mileage && t.due_mileage >= bike.current_mileage;
      return (dueDate && dueDate >= now) || dueMileageOk;
    }).length;
  };

  const isMaintenanceDue = (task, bike) => {
    if (task.completed) return false;
    const now = new Date();
    const dueDatePassed = task.due_date && new Date(task.due_date) < now;
    const dueMileagePassed = task.due_mileage && bike.current_mileage >= task.due_mileage;
    return dueDatePassed || dueMileagePassed;
  };

  const sortMaintenance = (tasks, bike) => {
    return [...tasks].sort((a, b) => {
      const aDue = a.due_mileage ? (a.due_mileage - bike.current_mileage) : 999999;
      const bDue = b.due_mileage ? (b.due_mileage - bike.current_mileage) : 999999;
      return aDue - bDue;
    });
  };

  const copyInviteCode = (code) => {
    navigator.clipboard.writeText(code);
    alert('Invite code copied: ' + code);
  };

  // ============================
  // LOADING / AUTH GATE
  // ============================
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // ============================
  // AUTH VIEW
  // ============================
  if (view === 'auth' || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 shadow-2xl">
            <div className="flex items-center justify-center mb-8">
              <BikeIcon className="w-12 h-12 text-gray-400 mr-3" />
              <h1 className="text-3xl font-bold text-white">Garage 43</h1>
            </div>
            <p className="text-gray-500 text-center mb-8 text-sm">Manage your garages and motorcycle maintenance</p>

            <div className="flex mb-6 bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => { setAuthMode('signin'); setAuthError(''); }}
                className={`flex-1 py-2 rounded text-sm font-semibold transition-colors ${authMode === 'signin' ? 'bg-gray-700 text-white' : 'text-gray-500'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                className={`flex-1 py-2 rounded text-sm font-semibold transition-colors ${authMode === 'signup' ? 'bg-gray-700 text-white' : 'text-gray-500'}`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
                />
              </div>
              {authError && <p className="text-red-400 text-sm">{authError}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50"
              >
                {loading ? 'Please wait...' : authMode === 'signup' ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            {authMode === 'signup' && (
              <p className="text-gray-600 text-xs text-center mt-6">Check your email to confirm your account after signing up.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============================
  // GARAGES LIST VIEW
  // ============================
  if (view === 'garages') {
    return (
      <div className="min-h-screen bg-black">
        <div className="bg-gray-900 border-b border-gray-800 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <BikeIcon className="w-8 h-8 text-gray-400 mr-3" />
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

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
            <h2 className="text-3xl font-bold text-white">Your Garages</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinGarage(true)}
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded font-semibold transition-colors"
              >
                <KeyRound className="w-4 h-4" />
                <span>Join Garage</span>
              </button>
              <button
                onClick={() => setShowAddGarage(true)}
                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded font-semibold transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Garage</span>
              </button>
            </div>
          </div>

          {showAddGarage && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 w-full max-w-md">
                <h3 className="text-2xl font-bold text-white mb-6">Add New Garage</h3>
                <form onSubmit={handleAddGarage} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Garage Name</label>
                    <input
                      type="text"
                      value={garageName}
                      onChange={(e) => setGarageName(e.target.value)}
                      placeholder="e.g., Home Garage"
                      className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Location (optional)</label>
                    <input
                      type="text"
                      value={garageLocation}
                      onChange={(e) => setGarageLocation(e.target.value)}
                      placeholder="e.g., Menomonee Falls, WI"
                      className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
                    />
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Creating...' : 'Create Garage'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddGarage(false)}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold py-2 px-4 rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showJoinGarage && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 w-full max-w-md">
                <h3 className="text-2xl font-bold text-white mb-2">Join a Garage</h3>
                <p className="text-gray-500 text-sm mb-6">Enter the invite code someone shared with you.</p>
                <form onSubmit={handleJoinGarage} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Invite Code</label>
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      placeholder="e.g., a1b2c3d4"
                      className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
                    />
                  </div>
                  {joinError && <p className="text-red-400 text-sm">{joinError}</p>}
                  <div className="flex gap-3 mt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Joining...' : 'Join Garage'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowJoinGarage(false); setJoinError(''); setJoinCode(''); }}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold py-2 px-4 rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {garages.length === 0 ? (
            <div className="text-center py-16">
              <Warehouse className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-6">No garages yet. Create one or join with an invite code.</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowAddGarage(true)}
                  className="inline-flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded font-semibold transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Garage</span>
                </button>
                <button
                  onClick={() => setShowJoinGarage(true)}
                  className="inline-flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-200 px-6 py-3 rounded font-semibold transition-colors"
                >
                  <KeyRound className="w-5 h-5" />
                  <span>Join Garage</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {garages.map(garage => (
                <div
                  key={garage.id}
                  onClick={() => {
                    setSelectedGarage(garage);
                    setView('garage-detail');
                  }}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-600 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{garage.name}</h3>
                      {garage.location && <p className="text-gray-500 text-sm">{garage.location}</p>}
                    </div>
                    <Warehouse className="w-8 h-8 text-gray-400 group-hover:text-gray-300" />
                  </div>

                  {garage.myRole === 'owner' && (
                    <span className="inline-block bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded mb-3">Owner</span>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                    <div className="flex items-center space-x-2">
                      <BikeIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400 text-sm">{garage.bikeCount} bike{garage.bikeCount !== 1 ? 's' : ''}</span>
                    </div>
                    {garage.upcomingCount > 0 ? (
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 text-sm font-medium">{garage.upcomingCount} due</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm font-medium">All current</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================
  // GARAGE DETAIL VIEW
  // ============================
  if (view === 'garage-detail' && selectedGarage) {
    const isOwner = selectedGarage.myRole === 'owner';

    return (
      <div className="min-h-screen bg-black">
        <div className="bg-gray-900 border-b border-gray-800 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <button
              onClick={() => {
                setView('garages');
                setSelectedGarage(null);
              }}
              className="flex items-center space-x-2 text-gray-500 hover:text-white transition-colors mb-4"
            >
              <span>← Your Garages</span>
            </button>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center space-x-3">
                <Warehouse className="w-7 h-7 text-gray-400" />
                <div>
                  <h1 className="text-3xl font-bold text-white">{selectedGarage.name}</h1>
                  {selectedGarage.location && <p className="text-gray-500">{selectedGarage.location}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMembers(true)}
                  className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded text-sm font-medium transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span>Members</span>
                </button>
                {isOwner ? (
                  <button
                    onClick={() => deleteGarage(selectedGarage.id)}
                    className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                  >
                    Delete Garage
                  </button>
                ) : (
                  <button
                    onClick={leaveGarage}
                    className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                  >
                    Leave Garage
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Members Modal */}
        {showMembers && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 w-full max-w-md">
              <h3 className="text-2xl font-bold text-white mb-2">Garage Members</h3>

              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <p className="text-gray-500 text-xs mb-1">Invite Code</p>
                <div className="flex items-center justify-between">
                  <code className="text-white font-mono text-lg">{selectedGarage.invite_code}</code>
                  <button
                    onClick={() => copyInviteCode(selectedGarage.invite_code)}
                    className="flex items-center space-x-1 text-gray-300 hover:text-white text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                </div>
                <p className="text-gray-600 text-xs mt-2">Share this code so others can join this garage.</p>
              </div>

              <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
                {garageMembers.map(m => (
                  <div key={m.id} className="flex items-center justify-between bg-gray-800 rounded px-4 py-3">
                    <div>
                      <p className="text-white text-sm font-medium">
                        {m.profiles?.display_name || m.profiles?.email}
                        {m.user_id === user.id && <span className="text-gray-500"> (you)</span>}
                      </p>
                      <p className="text-gray-500 text-xs capitalize">{m.role}</p>
                    </div>
                    {isOwner && m.user_id !== user.id && (
                      <button
                        onClick={() => removeMember(m.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowMembers(false)}
                className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold py-2 px-4 rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Bikes in this Garage</h2>
            <button
              onClick={() => setShowAddBike(true)}
              className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded font-semibold transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Bike</span>
            </button>
          </div>

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
                      className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
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
                        className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Model</label>
                      <input
                        type="text"
                        value={bikeModel}
                        onChange={(e) => setBikeModel(e.target.value)}
                        placeholder="FLHRI"
                        className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
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
                      className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
                    />
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Creating...' : 'Create Bike'}
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

          {bikes.length === 0 ? (
            <div className="text-center py-16">
              <BikeIcon className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-6">No bikes in this garage yet.</p>
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
                const upcomingCount = getBikeUpcomingCount(bike);

                return (
                  <div
                    key={bike.id}
                    onClick={() => {
                      setSelectedBike(bike);
                      setView('bike-detail');
                    }}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-600 hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">{bike.year} {bike.name}</h3>
                        <p className="text-gray-500 text-sm">{bike.model}</p>
                      </div>
                      <BikeIcon className="w-8 h-8 text-gray-400 group-hover:text-gray-300" />
                    </div>

                    <div className="bg-gray-800 rounded px-3 py-2 mb-4">
                      <p className="text-gray-300 text-sm font-semibold">{bike.current_mileage.toLocaleString()} mi</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-800">
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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================
  // BIKE DETAIL VIEW
  // ============================
  if (view === 'bike-detail' && selectedBike && selectedGarage) {
    const upcomingMaintenance = sortMaintenance(
      maintenanceTasks.filter(m => !m.completed),
      selectedBike
    );
    const completedMaintenance = sortMaintenance(
      maintenanceTasks.filter(m => m.completed),
      selectedBike
    );

    const totalSpent = maintenanceTasks
      .filter(m => m.completed)
      .reduce((sum, m) => sum + getTotalCost(m), 0);

    return (
      <div className="min-h-screen bg-black">
        <div className="bg-gray-900 border-b border-gray-800 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center text-sm text-gray-500 mb-4 space-x-2 flex-wrap">
              <button
                onClick={() => {
                  setView('garages');
                  setSelectedGarage(null);
                  setSelectedBike(null);
                }}
                className="hover:text-white transition-colors"
              >
                Your Garages
              </button>
              <ChevronRight className="w-4 h-4" />
              <button
                onClick={() => {
                  setView('garage-detail');
                  setSelectedBike(null);
                }}
                className="hover:text-white transition-colors"
              >
                {selectedGarage.name}
              </button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-300">{selectedBike.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">{selectedBike.year} {selectedBike.name}</h1>
                <p className="text-gray-500">{selectedBike.model}</p>
              </div>
              <button
                onClick={() => deleteBike(selectedBike.id)}
                className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
              >
                Delete Bike
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border-b border-gray-800 px-4 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-500 text-sm mb-1">Current Mileage</p>
                <div className="flex items-end justify-between">
                  <p className="text-white font-bold text-2xl">{selectedBike.current_mileage.toLocaleString()}</p>
                  <button
                    onClick={() => {
                      setCurrentMileageInput(selectedBike.current_mileage.toString());
                      setShowUpdateMileage(true);
                    }}
                    className="text-gray-300 hover:text-white text-xs font-semibold"
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
                <p className="text-gray-300 font-bold text-2xl">{maintenanceTasks.length}</p>
              </div>
            </div>
          </div>
        </div>

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
                    className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-gray-500"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update'}
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
                      className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
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
                        className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Due Mileage (optional)</label>
                      <input
                        type="number"
                        value={maintenanceDueMileage}
                        onChange={(e) => setMaintenanceDueMileage(e.target.value)}
                        placeholder="e.g., 5000"
                        className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
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
                          className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
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
                          className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
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
                      className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 resize-none"
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
                    <p className="text-gray-600 text-xs mt-2">Note: photos are stored as embedded data for now. For production use, set up Supabase Storage.</p>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Adding...' : 'Add Task'}
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
                  const mileageUntilDue = task.due_mileage ? task.due_mileage - selectedBike.current_mileage : null;

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

                          <div className="flex flex-wrap gap-3 mb-2">
                            {task.due_mileage && (
                              <div className={`text-sm ${isDue ? 'text-red-400' : 'text-gray-500'}`}>
                                <span className="font-semibold">Mileage:</span> {task.due_mileage.toLocaleString()} mi
                                {mileageUntilDue !== null && (
                                  <span className={mileageUntilDue < 0 ? 'text-red-400 ml-2' : 'text-gray-600 ml-2'}>
                                    ({mileageUntilDue > 0 ? '+' : ''}{mileageUntilDue.toLocaleString()} mi)
                                  </span>
                                )}
                              </div>
                            )}
                            {task.due_date && (
                              <div className={`text-sm ${isDue ? 'text-red-400' : 'text-gray-500'}`}>
                                <span className="font-semibold">Date:</span> {new Date(task.due_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>

                          {getTotalCost(task) > 0 && (
                            <div className="text-sm text-gray-500 mb-2">
                              <DollarSign className="w-4 h-4 inline mr-1" />
                              {task.parts_cost > 0 && <span>Parts: ${parseFloat(task.parts_cost).toFixed(2)} </span>}
                              {task.labor_cost > 0 && <span>Labor: ${parseFloat(task.labor_cost).toFixed(2)} </span>}
                              <span className="font-semibold">Total: ${getTotalCost(task).toFixed(2)}</span>
                            </div>
                          )}

                          {task.notes && <p className="text-gray-500 text-sm mb-2">{task.notes}</p>}
                          {task.photo_url && (
                            <img src={task.photo_url} alt={task.task} className="w-full h-32 object-cover rounded mt-2 mb-2" />
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => toggleMaintenanceComplete(task)}
                            className="text-gray-500 hover:text-green-400 transition-colors"
                            title="Mark complete"
                          >
                            <CheckCircle2 className="w-6 h-6" />
                          </button>
                          <button
                            onClick={() => deleteMaintenanceTask(task.id)}
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
                        <h4 className="text-gray-300 font-semibold mb-2">{task.task}</h4>

                        <div className="flex flex-wrap gap-3 mb-2">
                          <div className="text-sm text-gray-600">
                            <span className="font-semibold">Completed:</span> {new Date(task.completed_date).toLocaleDateString()}
                          </div>
                          {task.completed_mileage && (
                            <div className="text-sm text-gray-600">
                              <span className="font-semibold">Mileage:</span> {task.completed_mileage.toLocaleString()} mi
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
                        {task.photo_url && (
                          <img src={task.photo_url} alt={task.task} className="w-full h-32 object-cover rounded mt-2" />
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => toggleMaintenanceComplete(task)}
                          className="text-gray-700 hover:text-yellow-400 transition-colors"
                          title="Mark incomplete"
                        >
                          <CheckCircle2 className="w-6 h-6" />
                        </button>
                        <button
                          onClick={() => deleteMaintenanceTask(task.id)}
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

  return null;
}

export default GarageApp;
