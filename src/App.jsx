import React, { useState, useEffect } from 'react';
import {
  Plus, CheckCircle2, AlertCircle, LogOut, Bike as BikeIcon,
  DollarSign, Copy, Warehouse, ChevronRight, Users, KeyRound,
  Trash2, MessageSquare, Calendar, LayoutDashboard, Pin,
  ArrowLeftRight, ShieldCheck, Clock
} from 'lucide-react';
import { supabase } from './supabaseClient';
import GarageDashboard from './GarageDashboard';

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

const ROLE_LABELS = { owner: 'Owner', manager: 'Manager', member: 'Member' };
const ROLE_COLORS = { owner: 'text-yellow-400', manager: 'text-blue-400', member: 'text-gray-400' };

function GarageApp() {
  const [view, setView] = useState('auth');
  const [activeTab, setActiveTab] = useState('bikes');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState('signin');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  // Data
  const [garages, setGarages] = useState([]);
  const [selectedGarage, setSelectedGarage] = useState(null);
  const [myRole, setMyRole] = useState('member');
  const [garageMembers, setGarageMembers] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [selectedBike, setSelectedBike] = useState(null);
  const [maintenanceTasks, setMaintenanceTasks] = useState([]);
  const [posts, setPosts] = useState([]);
  const [expandedPost, setExpandedPost] = useState(null);
  const [replies, setReplies] = useState({});
  const [liftBookings, setLiftBookings] = useState([]);

  // Modals
  const [showAddGarage, setShowAddGarage] = useState(false);
  const [showJoinGarage, setShowJoinGarage] = useState(false);
  const [showAddBike, setShowAddBike] = useState(false);
  const [showAddMaintenance, setShowAddMaintenance] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showUpdateMileage, setShowUpdateMileage] = useState(false);
  const [showTransferOwnership, setShowTransferOwnership] = useState(false);
  const [showBookLift, setShowBookLift] = useState(false);

  // Filters
  const [liftFilter, setLiftFilter] = useState('all');

  // Forms
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
  const [newPostBody, setNewPostBody] = useState('');
  const [replyBody, setReplyBody] = useState({});
  const [transferToId, setTransferToId] = useState('');
  const [liftNumber, setLiftNumber] = useState(1);
  const [liftBikeId, setLiftBikeId] = useState('');
  const [liftDate, setLiftDate] = useState('');
  const [liftAllDay, setLiftAllDay] = useState(false);
  const [liftStartTime, setLiftStartTime] = useState('');
  const [liftEndTime, setLiftEndTime] = useState('');
  const [liftNote, setLiftNote] = useState('');

  // ============================
  // AUTH
  // ============================
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (session?.user) setView('garages');
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setView('garages');
      else { setView('auth'); setGarages([]); setSelectedGarage(null); setSelectedBike(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { if (user && view === 'garages') fetchGarages(); }, [user, view]);
  useEffect(() => {
    if (selectedGarage && view === 'garage-dashboard') {
      fetchBikes(selectedGarage.id);
      fetchMembers(selectedGarage.id);
      fetchPosts(selectedGarage.id);
      fetchLiftBookings(selectedGarage.id);
    }
  }, [selectedGarage, view]);
  useEffect(() => { if (selectedBike && view === 'bike-detail') fetchMaintenance(selectedBike.id); }, [selectedBike, view]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!email || !password) return;
    setLoading(true);
    if (authMode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setAuthError(error.message);
      else setAuthError('Check your email to confirm your account, then sign in.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
    }
    setLoading(false);
    setEmail(''); setPassword('');
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };

  // ============================
  // GARAGES
  // ============================
  const fetchGarages = async () => {
    setLoading(true);
    const { data: memberships } = await supabase
      .from('garage_members').select('garage_id, role').eq('user_id', user.id);
    if (!memberships || memberships.length === 0) { setGarages([]); setLoading(false); return; }
    const garageIds = memberships.map(m => m.garage_id);
    const { data: garagesData } = await supabase.from('garages').select('*').in('id', garageIds);
    const enriched = (garagesData || []).map(g => ({
      ...g,
      myRole: memberships.find(m => m.garage_id === g.id)?.role || 'member'
    }));
    setGarages(enriched);
    setLoading(false);
  };

  const handleAddGarage = async (e) => {
    e.preventDefault();
    if (!garageName) return;
    setLoading(true);
    const { error } = await supabase.from('garages').insert({ name: garageName, location: garageLocation, owner_id: user.id });
    setLoading(false);
    if (error) { alert('Error: ' + error.message); return; }
    setGarageName(''); setGarageLocation(''); setShowAddGarage(false);
    fetchGarages();
  };

  const handleJoinGarage = async (e) => {
    e.preventDefault();
    setJoinError('');
    if (!joinCode) return;
    setLoading(true);
    const { data: garage } = await supabase.from('garages').select('id').eq('invite_code', joinCode.trim().toLowerCase()).maybeSingle();
    if (!garage) { setJoinError('No garage found with that invite code.'); setLoading(false); return; }
    const { error } = await supabase.from('garage_members').insert({ garage_id: garage.id, user_id: user.id, role: 'member' });
    setLoading(false);
    if (error) { setJoinError(error.code === '23505' ? "You're already a member." : error.message); return; }
    setJoinCode(''); setShowJoinGarage(false); fetchGarages();
  };

  const deleteGarage = async () => {
    if (!confirm('Delete this garage and all its data?')) return;
    await supabase.from('garages').delete().eq('id', selectedGarage.id);
    setSelectedGarage(null); setView('garages'); fetchGarages();
  };

  const fetchMembers = async (garageId) => {
    const { data: members } = await supabase
      .from('garage_members')
      .select('id, user_id, role, joined_at')
      .eq('garage_id', garageId);

    if (!members || members.length === 0) {
      setGarageMembers([]);
      return;
    }

    const userIds = members.map(m => m.user_id);
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, email, display_name')
      .in('id', userIds);

    const profileMap = {};
    (profilesData || []).forEach(p => { profileMap[p.id] = p; });

    const enriched = members.map(m => ({
      ...m,
      profiles: profileMap[m.user_id] || { email: 'Unknown', display_name: null }
    }));

    setGarageMembers(enriched);
    const me = enriched.find(m => m.user_id === user.id);
    setMyRole(me?.role || 'member');
  };

  const updateMemberRole = async (membershipId, newRole) => {
    const { error } = await supabase.from('garage_members').update({ role: newRole }).eq('id', membershipId);
    if (error) { alert('Error: ' + error.message); return; }
    fetchMembers(selectedGarage.id);
  };

  const removeMember = async (membershipId) => {
    if (!confirm('Remove this member?')) return;
    await supabase.from('garage_members').delete().eq('id', membershipId);
    fetchMembers(selectedGarage.id);
  };

  const leaveGarage = async () => {
    if (!confirm('Leave this garage?')) return;
    const me = garageMembers.find(m => m.user_id === user.id);
    if (me) await supabase.from('garage_members').delete().eq('id', me.id);
    setSelectedGarage(null); setView('garages'); fetchGarages();
  };

  const saveDashboardLayout = async (layout) => {
    const { error } = await supabase
      .from('garages')
      .update({ dashboard_layout: layout })
      .eq('id', selectedGarage.id);
    if (error) { alert('Error saving layout: ' + error.message); return; }
    setSelectedGarage(prev => ({ ...prev, dashboard_layout: layout }));
  };

  const transferOwnership = async () => {
    if (!transferToId) return;
    // Update target to owner
    const target = garageMembers.find(m => m.user_id === transferToId);
    if (!target) return;
    await supabase.from('garage_members').update({ role: 'owner' }).eq('id', target.id);
    // Demote current owner to manager
    const me = garageMembers.find(m => m.user_id === user.id);
    if (me) await supabase.from('garage_members').update({ role: 'manager' }).eq('id', me.id);
    // Update owner_id on garage
    await supabase.from('garages').update({ owner_id: transferToId }).eq('id', selectedGarage.id);
    setShowTransferOwnership(false);
    fetchMembers(selectedGarage.id);
    setMyRole('manager');
  };

  // ============================
  // BIKES
  // ============================
  const fetchBikes = async (garageId) => {
    const { data } = await supabase.from('bikes')
      .select('*, maintenance_tasks(id, completed, due_date, due_mileage)')
      .eq('garage_id', garageId);
    setBikes(data || []);
  };

  const handleAddBike = async (e) => {
    e.preventDefault();
    if (!bikeName || !bikeYear || !bikeModel || !bikeMileage) return;
    setLoading(true);
    const { error } = await supabase.from('bikes').insert({
      garage_id: selectedGarage.id, name: bikeName, year: bikeYear,
      model: bikeModel, current_mileage: parseInt(bikeMileage), added_by: user.id
    });
    setLoading(false);
    if (error) { alert('Error: ' + error.message); return; }
    setBikeName(''); setBikeYear(''); setBikeModel(''); setBikeMileage('');
    setShowAddBike(false); fetchBikes(selectedGarage.id);
  };

  const handleUpdateMileage = async (e) => {
    e.preventDefault();
    if (!currentMileageInput) return;
    await supabase.from('bikes').update({ current_mileage: parseInt(currentMileageInput) }).eq('id', selectedBike.id);
    setSelectedBike({ ...selectedBike, current_mileage: parseInt(currentMileageInput) });
    setCurrentMileageInput(''); setShowUpdateMileage(false);
  };

  const deleteBike = async () => {
    if (!confirm('Delete this bike and all its history?')) return;
    await supabase.from('bikes').delete().eq('id', selectedBike.id);
    setSelectedBike(null); setView('garage-dashboard'); fetchBikes(selectedGarage.id);
  };

  const canEditBike = (bike) => myRole === 'owner' || myRole === 'manager' || bike.added_by === user.id;

  // ============================
  // MAINTENANCE
  // ============================
  const fetchMaintenance = async (bikeId) => {
    const { data } = await supabase.from('maintenance_tasks').select('*').eq('bike_id', bikeId).order('created_at', { ascending: false });
    setMaintenanceTasks(data || []);
  };

  const handleAddMaintenance = async (e) => {
    e.preventDefault();
    if (!maintenanceTask) return;
    setLoading(true);
    await supabase.from('maintenance_tasks').insert({
      bike_id: selectedBike.id, task: maintenanceTask,
      due_date: maintenanceDueDate || null,
      due_mileage: maintenanceDueMileage ? parseInt(maintenanceDueMileage) : null,
      notes: maintenanceNotes,
      parts_cost: maintenancePartsCost ? parseFloat(maintenancePartsCost) : 0,
      labor_cost: maintenanceLaborCost ? parseFloat(maintenanceLaborCost) : 0,
      photo_url: maintenancePhoto || null, completed: false
    });
    setLoading(false);
    setMaintenanceTask(''); setMaintenanceDueDate(''); setMaintenanceDueMileage('');
    setMaintenanceNotes(''); setMaintenancePartsCost(''); setMaintenanceLaborCost('');
    setMaintenancePhoto(''); setShowAddMaintenance(false);
    fetchMaintenance(selectedBike.id);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setMaintenancePhoto(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const applyTemplate = async (key) => {
    const template = MAINTENANCE_TEMPLATES[key];
    const tasks = template.tasks.map(t => ({
      bike_id: selectedBike.id, task: t.task,
      due_mileage: selectedBike.current_mileage + t.mileageInterval,
      parts_cost: t.estimatedCost, labor_cost: 0, completed: false
    }));
    await supabase.from('maintenance_tasks').insert(tasks);
    setShowTemplates(false); fetchMaintenance(selectedBike.id);
  };

  const toggleComplete = async (task) => {
    await supabase.from('maintenance_tasks').update({
      completed: !task.completed,
      completed_date: !task.completed ? new Date().toISOString().split('T')[0] : null,
      completed_mileage: !task.completed ? selectedBike.current_mileage : null
    }).eq('id', task.id);
    fetchMaintenance(selectedBike.id);
  };

  const deleteTask = async (id) => {
    if (!confirm('Delete this task?')) return;
    await supabase.from('maintenance_tasks').delete().eq('id', id);
    fetchMaintenance(selectedBike.id);
  };

  // ============================
  // MESSAGE BOARD
  // ============================
  const fetchPosts = async (garageId) => {
    const { data: postsData } = await supabase
      .from('garage_posts')
      .select('*, garage_replies(id)')
      .eq('garage_id', garageId)
      .order('pinned', { ascending: false })
      .order('updated_at', { ascending: false });

    if (!postsData || postsData.length === 0) { setPosts([]); return; }

    const userIds = [...new Set(postsData.map(p => p.user_id))];
    const { data: profilesData } = await supabase
      .from('profiles').select('id, email, display_name').in('id', userIds);
    const profileMap = {};
    (profilesData || []).forEach(p => { profileMap[p.id] = p; });

    setPosts(postsData.map(p => ({ ...p, profiles: profileMap[p.user_id] || { email: 'Unknown', display_name: null } })));
  };

  const fetchReplies = async (postId) => {
    const { data: repliesData } = await supabase
      .from('garage_replies')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (!repliesData || repliesData.length === 0) { setReplies(prev => ({ ...prev, [postId]: [] })); return; }

    const userIds = [...new Set(repliesData.map(r => r.user_id))];
    const { data: profilesData } = await supabase
      .from('profiles').select('id, email, display_name').in('id', userIds);
    const profileMap = {};
    (profilesData || []).forEach(p => { profileMap[p.id] = p; });

    setReplies(prev => ({
      ...prev,
      [postId]: repliesData.map(r => ({ ...r, profiles: profileMap[r.user_id] || { email: 'Unknown', display_name: null } }))
    }));
  };

  const handleExpandPost = (post) => {
    if (expandedPost === post.id) { setExpandedPost(null); return; }
    setExpandedPost(post.id);
    fetchReplies(post.id);
  };

  const submitPost = async () => {
    if (!newPostBody.trim()) return;
    await supabase.from('garage_posts').insert({ garage_id: selectedGarage.id, user_id: user.id, body: newPostBody.trim() });
    setNewPostBody('');
    fetchPosts(selectedGarage.id);
  };

  const submitReply = async (postId) => {
    const body = replyBody[postId];
    if (!body?.trim()) return;
    await supabase.from('garage_replies').insert({ post_id: postId, user_id: user.id, body: body.trim() });
    setReplyBody(prev => ({ ...prev, [postId]: '' }));
    fetchReplies(postId);
    fetchPosts(selectedGarage.id);
  };

  const togglePin = async (post) => {
    await supabase.from('garage_posts').update({ pinned: !post.pinned }).eq('id', post.id);
    fetchPosts(selectedGarage.id);
  };

  const deletePost = async (postId) => {
    if (!confirm('Delete this post and all its replies?')) return;
    await supabase.from('garage_posts').delete().eq('id', postId);
    fetchPosts(selectedGarage.id);
  };

  const deleteReply = async (replyId, postId) => {
    await supabase.from('garage_replies').delete().eq('id', replyId);
    fetchReplies(postId);
  };

  // ============================
  // LIFT SCHEDULE
  // ============================
  const fetchLiftBookings = async (garageId) => {
    const { data: bookingsData } = await supabase
      .from('lift_bookings')
      .select('*')
      .eq('garage_id', garageId)
      .order('booking_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (!bookingsData || bookingsData.length === 0) { setLiftBookings([]); return; }

    const userIds = [...new Set(bookingsData.map(b => b.requested_by))];
    const bikeIds = [...new Set(bookingsData.map(b => b.bike_id).filter(Boolean))];

    const [{ data: profilesData }, { data: bikesData }] = await Promise.all([
      supabase.from('profiles').select('id, email, display_name').in('id', userIds),
      bikeIds.length > 0 ? supabase.from('bikes').select('id, name, year').in('id', bikeIds) : { data: [] }
    ]);

    const profileMap = {};
    (profilesData || []).forEach(p => { profileMap[p.id] = p; });
    const bikeMap = {};
    (bikesData || []).forEach(b => { bikeMap[b.id] = b; });

    setLiftBookings(bookingsData.map(b => ({
      ...b,
      profiles: profileMap[b.requested_by] || { email: 'Unknown', display_name: null },
      bikes: b.bike_id ? bikeMap[b.bike_id] || null : null
    })));
  };

  const handleBookLift = async (e) => {
    e.preventDefault();
    if (!liftDate) return;
    setLoading(true);
    await supabase.from('lift_bookings').insert({
      garage_id: selectedGarage.id,
      lift_number: liftNumber,
      bike_id: liftBikeId || null,
      requested_by: user.id,
      status: 'pending',
      booking_date: liftDate,
      start_time: !liftAllDay && liftStartTime ? liftStartTime : null,
      end_time: !liftAllDay && liftEndTime ? liftEndTime : null,
      all_day: liftAllDay,
      note: liftNote || null
    });
    setLoading(false);
    setLiftNumber(1); setLiftBikeId(''); setLiftDate(''); setLiftAllDay(false);
    setLiftStartTime(''); setLiftEndTime(''); setLiftNote('');
    setShowBookLift(false); fetchLiftBookings(selectedGarage.id);
  };

  const approveLift = async (bookingId) => {
    await supabase.from('lift_bookings').update({ status: 'approved', approved_by: user.id }).eq('id', bookingId);
    fetchLiftBookings(selectedGarage.id);
  };

  const cancelLift = async (bookingId) => {
    await supabase.from('lift_bookings').update({ status: 'cancelled' }).eq('id', bookingId);
    fetchLiftBookings(selectedGarage.id);
  };

  const deleteLift = async (bookingId) => {
    if (!confirm('Delete this booking?')) return;
    await supabase.from('lift_bookings').delete().eq('id', bookingId);
    fetchLiftBookings(selectedGarage.id);
  };

  // ============================
  // HELPERS
  // ============================
  const getTotalCost = (t) => (parseFloat(t.parts_cost) || 0) + (parseFloat(t.labor_cost) || 0);

  const getBikeUpcomingCount = (bike) => {
    const tasks = bike.maintenance_tasks || [];
    const now = new Date();
    return tasks.filter(t => {
      if (t.completed) return false;
      const dueDate = t.due_date ? new Date(t.due_date) : null;
      return (dueDate && dueDate >= now) || (t.due_mileage && t.due_mileage >= bike.current_mileage);
    }).length;
  };

  const isMaintenanceDue = (task, bike) => {
    if (task.completed) return false;
    return (task.due_date && new Date(task.due_date) < new Date()) ||
           (task.due_mileage && bike.current_mileage >= task.due_mileage);
  };

  const sortMaintenance = (tasks, bike) => [...tasks].sort((a, b) => {
    const aDue = a.due_mileage ? a.due_mileage - bike.current_mileage : 999999;
    const bDue = b.due_mileage ? b.due_mileage - bike.current_mileage : 999999;
    return aDue - bDue;
  });

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); alert('Copied: ' + text); };

  const formatTime = (t) => { if (!t) return ''; const [h, m] = t.split(':'); const hr = parseInt(h); return `${hr % 12 || 12}:${m} ${hr < 12 ? 'AM' : 'PM'}`; };

  const filteredBookings = liftFilter === 'all' ? liftBookings : liftBookings.filter(b => b.lift_number === parseInt(liftFilter));

  // ============================
  // LOADING
  // ============================
  if (authLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  );

  // ============================
  // AUTH VIEW
  // ============================
  if (view === 'auth' || !user) return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 shadow-2xl">
          <div className="flex items-center justify-center mb-8">
            <BikeIcon className="w-12 h-12 text-gray-400 mr-3" />
            <h1 className="text-3xl font-bold text-white">Garage 43</h1>
          </div>
          <div className="flex mb-6 bg-gray-800 rounded-lg p-1">
            <button onClick={() => { setAuthMode('signin'); setAuthError(''); }}
              className={`flex-1 py-2 rounded text-sm font-semibold transition-colors ${authMode === 'signin' ? 'bg-gray-700 text-white' : 'text-gray-500'}`}>Sign In</button>
            <button onClick={() => { setAuthMode('signup'); setAuthError(''); }}
              className={`flex-1 py-2 rounded text-sm font-semibold transition-colors ${authMode === 'signup' ? 'bg-gray-700 text-white' : 'text-gray-500'}`}>Sign Up</button>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500" />
            </div>
            {authError && <p className={`text-sm ${authError.includes('Check your email') ? 'text-green-400' : 'text-red-400'}`}>{authError}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50">
              {loading ? 'Please wait...' : authMode === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  // ============================
  // GARAGES LIST VIEW
  // ============================
  if (view === 'garages') return (
    <div className="min-h-screen bg-black">
      <div className="bg-gray-900 border-b border-gray-800 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <BikeIcon className="w-8 h-8 text-gray-400 mr-3" />
            <h1 className="text-2xl font-bold text-white">Garage 43</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-500 text-sm hidden md:block">{user?.email}</span>
            <button onClick={handleLogout} className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded transition-colors">
              <LogOut className="w-4 h-4" /><span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <h2 className="text-3xl font-bold text-white">Your Garages</h2>
          <div className="flex gap-3">
            <button onClick={() => setShowJoinGarage(true)} className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded font-semibold transition-colors">
              <KeyRound className="w-4 h-4" /><span>Join Garage</span>
            </button>
            <button onClick={() => setShowAddGarage(true)} className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded font-semibold transition-colors">
              <Plus className="w-5 h-5" /><span>Add Garage</span>
            </button>
          </div>
        </div>

        {showAddGarage && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 w-full max-w-md">
              <h3 className="text-2xl font-bold text-white mb-6">Add New Garage</h3>
              <form onSubmit={handleAddGarage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Garage Name</label>
                  <input type="text" value={garageName} onChange={e => setGarageName(e.target.value)} placeholder="e.g., Home Garage"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Location (optional)</label>
                  <input type="text" value={garageLocation} onChange={e => setGarageLocation(e.target.value)} placeholder="e.g., Milwaukee, WI"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500" />
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" disabled={loading} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded disabled:opacity-50">
                    {loading ? 'Creating...' : 'Create Garage'}</button>
                  <button type="button" onClick={() => setShowAddGarage(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold py-2 rounded">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showJoinGarage && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 w-full max-w-md">
              <h3 className="text-2xl font-bold text-white mb-2">Join a Garage</h3>
              <p className="text-gray-500 text-sm mb-6">Enter the invite code shared with you.</p>
              <form onSubmit={handleJoinGarage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Invite Code</label>
                  <input type="text" value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="e.g., a1b2c3d4"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500" />
                </div>
                {joinError && <p className="text-red-400 text-sm">{joinError}</p>}
                <div className="flex gap-3 mt-6">
                  <button type="submit" disabled={loading} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded disabled:opacity-50">
                    {loading ? 'Joining...' : 'Join Garage'}</button>
                  <button type="button" onClick={() => { setShowJoinGarage(false); setJoinError(''); setJoinCode(''); }}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold py-2 rounded">Cancel</button>
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
              <button onClick={() => setShowAddGarage(true)} className="inline-flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded font-semibold transition-colors">
                <Plus className="w-5 h-5" /><span>Add Garage</span>
              </button>
              <button onClick={() => setShowJoinGarage(true)} className="inline-flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-200 px-6 py-3 rounded font-semibold transition-colors">
                <KeyRound className="w-5 h-5" /><span>Join Garage</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {garages.map(garage => (
              <div key={garage.id}
                onClick={() => { setSelectedGarage(garage); setMyRole(garage.myRole); setActiveTab('dashboard'); setView('garage-dashboard'); }}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-600 transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{garage.name}</h3>
                    {garage.location && <p className="text-gray-500 text-sm">{garage.location}</p>}
                  </div>
                  <Warehouse className="w-8 h-8 text-gray-400 group-hover:text-gray-300" />
                </div>
                <span className={`inline-block text-xs px-2 py-1 rounded bg-gray-800 mb-3 font-medium ${ROLE_COLORS[garage.myRole]}`}>
                  {ROLE_LABELS[garage.myRole]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ============================
  // GARAGE DASHBOARD
  // ============================
  if (view === 'garage-dashboard' && selectedGarage) {
    const isPrivileged = myRole === 'owner' || myRole === 'manager';
    const pendingCount = liftBookings.filter(b => b.status === 'pending').length;

    const TABS = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'bikes', label: 'Bikes', icon: BikeIcon },
      { id: 'schedule', label: 'Schedule', icon: Calendar, badge: isPrivileged && pendingCount > 0 ? pendingCount : null },
      { id: 'board', label: 'Board', icon: MessageSquare },
      { id: 'members', label: 'Members', icon: Users },
    ];

    return (
      <div className="min-h-screen bg-black">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-800 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <button onClick={() => { setView('garages'); setSelectedGarage(null); }}
              className="text-gray-500 hover:text-white transition-colors mb-3 text-sm">
              ← Your Garages
            </button>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center space-x-3">
                <Warehouse className="w-7 h-7 text-gray-400" />
                <div>
                  <h1 className="text-2xl font-bold text-white">{selectedGarage.name}</h1>
                  {selectedGarage.location && <p className="text-gray-500 text-sm">{selectedGarage.location}</p>}
                </div>
                <span className={`text-xs px-2 py-1 rounded bg-gray-800 font-medium ${ROLE_COLORS[myRole]}`}>
                  {ROLE_LABELS[myRole]}
                </span>
              </div>
              {myRole === 'owner' ? (
                <button onClick={deleteGarage} className="text-red-400 hover:text-red-300 text-sm font-medium">Delete Garage</button>
              ) : (
                <button onClick={leaveGarage} className="text-red-400 hover:text-red-300 text-sm font-medium">Leave Garage</button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mt-4 border-b border-gray-800 -mb-px">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors relative ${
                    activeTab === tab.id ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}>
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">

          {/* ── DASHBOARD TAB ── */}
          {activeTab === 'dashboard' && (
            <GarageDashboard
              garage={selectedGarage}
              myRole={myRole}
              bikes={bikes}
              liftBookings={liftBookings}
              posts={posts}
              members={garageMembers}
              onBikeClick={(bike) => { setSelectedBike(bike); setView('bike-detail'); }}
              onViewBoard={() => setActiveTab('board')}
              onLayoutSave={saveDashboardLayout}
            />
          )}

          {/* ── BIKES TAB ── */}
          {activeTab === 'bikes' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Bikes</h2>
                <button onClick={() => setShowAddBike(true)} className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded font-semibold transition-colors">
                  <Plus className="w-4 h-4" /><span>Add Bike</span>
                </button>
              </div>

              {showAddBike && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 w-full max-w-md">
                    <h3 className="text-2xl font-bold text-white mb-6">Add New Bike</h3>
                    <form onSubmit={handleAddBike} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Bike Name</label>
                        <input type="text" value={bikeName} onChange={e => setBikeName(e.target.value)} placeholder="e.g., Road King"
                          className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">Year</label>
                          <input type="number" value={bikeYear} onChange={e => setBikeYear(e.target.value)} placeholder="2001"
                            className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">Model</label>
                          <input type="text" value={bikeModel} onChange={e => setBikeModel(e.target.value)} placeholder="FLHRI"
                            className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Current Mileage</label>
                        <input type="number" value={bikeMileage} onChange={e => setBikeMileage(e.target.value)} placeholder="0"
                          className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500" />
                      </div>
                      <div className="flex gap-3 mt-6">
                        <button type="submit" disabled={loading} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded disabled:opacity-50">
                          {loading ? 'Creating...' : 'Create Bike'}</button>
                        <button type="button" onClick={() => setShowAddBike(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold py-2 rounded">Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {bikes.length === 0 ? (
                <div className="text-center py-16">
                  <BikeIcon className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-6">No bikes in this garage yet.</p>
                  <button onClick={() => setShowAddBike(true)} className="inline-flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded font-semibold transition-colors">
                    <Plus className="w-5 h-5" /><span>Add Bike</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bikes.map(bike => {
                    const upcomingCount = getBikeUpcomingCount(bike);
                    const isMine = bike.added_by === user.id;
                    return (
                      <div key={bike.id}
                        onClick={() => { setSelectedBike(bike); setView('bike-detail'); }}
                        className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-600 transition-all cursor-pointer group">
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
                          <div>
                            {isMine && <span className="text-gray-600 text-xs mr-3">My bike</span>}
                            {upcomingCount > 0 ? (
                              <span className="text-yellow-400 text-sm font-medium"><AlertCircle className="w-4 h-4 inline mr-1" />{upcomingCount} due</span>
                            ) : (
                              <span className="text-green-400 text-sm font-medium"><CheckCircle2 className="w-4 h-4 inline mr-1" />All current</span>
                            )}
                          </div>
                          {!canEditBike(bike) && <span className="text-gray-600 text-xs">View only</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ── SCHEDULE TAB ── */}
          {activeTab === 'schedule' && (
            <>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h2 className="text-2xl font-bold text-white">Lift Schedule</h2>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex bg-gray-800 rounded-lg p-1">
                    {['all', '1', '2'].map(f => (
                      <button key={f} onClick={() => setLiftFilter(f)}
                        className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${liftFilter === f ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                        {f === 'all' ? 'All Lifts' : `Lift ${f}`}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setShowBookLift(true)} className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded font-semibold transition-colors">
                    <Plus className="w-4 h-4" /><span>Request Slot</span>
                  </button>
                </div>
              </div>

              {showBookLift && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 overflow-y-auto">
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 w-full max-w-md my-8">
                    <h3 className="text-2xl font-bold text-white mb-6">Request Lift Slot</h3>
                    <form onSubmit={handleBookLift} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Lift</label>
                        <div className="flex gap-3">
                          {[1, 2].map(n => (
                            <button key={n} type="button" onClick={() => setLiftNumber(n)}
                              className={`flex-1 py-2 rounded font-semibold text-sm transition-colors ${liftNumber === n ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400'}`}>
                              Lift {n}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Bike (optional)</label>
                        <select value={liftBikeId} onChange={e => setLiftBikeId(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-gray-500">
                          <option value="">— No specific bike —</option>
                          {bikes.map(b => <option key={b.id} value={b.id}>{b.year} {b.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Date</label>
                        <input type="date" value={liftDate} onChange={e => setLiftDate(e.target.value)} required
                          className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-gray-500" />
                      </div>
                      <div className="flex items-center space-x-3">
                        <input type="checkbox" id="allDay" checked={liftAllDay} onChange={e => setLiftAllDay(e.target.checked)}
                          className="w-4 h-4 rounded bg-gray-800 border-gray-700" />
                        <label htmlFor="allDay" className="text-gray-400 text-sm">All day</label>
                      </div>
                      {!liftAllDay && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Start Time</label>
                            <input type="time" value={liftStartTime} onChange={e => setLiftStartTime(e.target.value)}
                              className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-gray-500" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">End Time</label>
                            <input type="time" value={liftEndTime} onChange={e => setLiftEndTime(e.target.value)}
                              className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-gray-500" />
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Note</label>
                        <input type="text" value={liftNote} onChange={e => setLiftNote(e.target.value)} placeholder="e.g., primary service, needs 2hrs"
                          className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500" />
                      </div>
                      <div className="flex gap-3 mt-6">
                        <button type="submit" disabled={loading} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded disabled:opacity-50">
                          {loading ? 'Submitting...' : 'Submit Request'}</button>
                        <button type="button" onClick={() => setShowBookLift(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold py-2 rounded">Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {filteredBookings.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No bookings yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredBookings.map(booking => {
                    const statusColors = { pending: 'text-yellow-400 bg-yellow-400', approved: 'text-green-400 bg-green-400', cancelled: 'text-gray-600 bg-gray-600' };
                    const canManage = isPrivileged || booking.requested_by === user.id;

                    return (
                      <div key={booking.id} className={`bg-gray-900 border rounded-lg p-4 ${booking.status === 'cancelled' ? 'border-gray-800 opacity-50' : 'border-gray-800'}`}>
                        <div className="flex items-start justify-between flex-wrap gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <span className="text-white font-semibold">Lift {booking.lift_number}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full bg-opacity-20 font-medium ${statusColors[booking.status]}`}>
                                {booking.status}
                              </span>
                              {booking.bikes && <span className="text-gray-400 text-sm">{booking.bikes.year} {booking.bikes.name}</span>}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(booking.booking_date + 'T12:00:00').toLocaleDateString()}
                              </span>
                              {!booking.all_day && booking.start_time && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(booking.start_time)}{booking.end_time && ` – ${formatTime(booking.end_time)}`}
                                </span>
                              )}
                              {booking.all_day && <span>All day</span>}
                              <span>by {booking.profiles?.display_name || booking.profiles?.email}</span>
                            </div>
                            {booking.note && <p className="text-gray-500 text-sm mt-2 italic">"{booking.note}"</p>}
                          </div>
                          {canManage && booking.status !== 'cancelled' && (
                            <div className="flex items-center gap-2">
                              {isPrivileged && booking.status === 'pending' && (
                                <button onClick={() => approveLift(booking.id)} className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors">Approve</button>
                              )}
                              {booking.status !== 'cancelled' && (
                                <button onClick={() => cancelLift(booking.id)} className="text-gray-500 hover:text-red-400 text-sm transition-colors">Cancel</button>
                              )}
                              {isPrivileged && (
                                <button onClick={() => deleteLift(booking.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ── BOARD TAB ── */}
          {activeTab === 'board' && (
            <>
              <h2 className="text-2xl font-bold text-white mb-6">Message Board</h2>

              {/* New post */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
                <textarea
                  value={newPostBody}
                  onChange={e => setNewPostBody(e.target.value)}
                  placeholder="Share an update, note, or question..."
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 resize-none mb-3"
                />
                <div className="flex justify-end">
                  <button onClick={submitPost} disabled={!newPostBody.trim()}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded font-semibold transition-colors disabled:opacity-40">
                    Post
                  </button>
                </div>
              </div>

              {posts.length === 0 ? (
                <div className="text-center py-16">
                  <MessageSquare className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No posts yet. Be the first to post something.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map(post => {
                    const isOpen = expandedPost === post.id;
                    const canDeletePost = post.user_id === user.id || isPrivileged;
                    const postReplies = replies[post.id] || [];

                    return (
                      <div key={post.id} className={`bg-gray-900 border rounded-lg ${post.pinned ? 'border-yellow-600' : 'border-gray-800'}`}>
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              {post.pinned && (
                                <div className="flex items-center gap-1 text-yellow-500 text-xs font-medium mb-2">
                                  <Pin className="w-3 h-3" /><span>Pinned</span>
                                </div>
                              )}
                              <p className="text-white">{post.body}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-600 flex-wrap">
                                <span>{post.profiles?.display_name || post.profiles?.email}</span>
                                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                <button onClick={() => handleExpandPost(post)} className="text-gray-500 hover:text-white transition-colors">
                                  {post.garage_replies?.length || 0} {(post.garage_replies?.length || 0) === 1 ? 'reply' : 'replies'} {isOpen ? '▲' : '▼'}
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isPrivileged && (
                                <button onClick={() => togglePin(post)} className={`transition-colors ${post.pinned ? 'text-yellow-500 hover:text-gray-400' : 'text-gray-600 hover:text-yellow-500'}`} title={post.pinned ? 'Unpin' : 'Pin'}>
                                  <Pin className="w-4 h-4" />
                                </button>
                              )}
                              {canDeletePost && (
                                <button onClick={() => deletePost(post.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {isOpen && (
                          <div className="border-t border-gray-800 px-4 pb-4">
                            <div className="space-y-3 mt-3 mb-4">
                              {postReplies.length === 0 ? (
                                <p className="text-gray-600 text-sm">No replies yet.</p>
                              ) : (
                                postReplies.map(reply => {
                                  const canDeleteReply = reply.user_id === user.id || isPrivileged;
                                  return (
                                    <div key={reply.id} className="flex items-start gap-3">
                                      <div className="w-1 bg-gray-700 rounded-full self-stretch min-h-4 mt-1 shrink-0" />
                                      <div className="flex-1">
                                        <p className="text-gray-300 text-sm">{reply.body}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                                          <span>{reply.profiles?.display_name || reply.profiles?.email}</span>
                                          <span>{new Date(reply.created_at).toLocaleDateString()}</span>
                                          {canDeleteReply && (
                                            <button onClick={() => deleteReply(reply.id, post.id)} className="text-gray-700 hover:text-red-400 transition-colors">delete</button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                            <div className="flex gap-3">
                              <input
                                type="text"
                                value={replyBody[post.id] || ''}
                                onChange={e => setReplyBody(prev => ({ ...prev, [post.id]: e.target.value }))}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitReply(post.id); }}}
                                placeholder="Write a reply..."
                                className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 text-sm"
                              />
                              <button onClick={() => submitReply(post.id)} disabled={!replyBody[post.id]?.trim()}
                                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-40">
                                Reply
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ── MEMBERS TAB ── */}
          {activeTab === 'members' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Members</h2>
                {isPrivileged && (
                  <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-3">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Invite Code</p>
                      <code className="text-white font-mono">{selectedGarage.invite_code}</code>
                    </div>
                    <button onClick={() => copyToClipboard(selectedGarage.invite_code)} className="text-gray-400 hover:text-white transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {myRole === 'owner' && (
                <div className="mb-6">
                  <button onClick={() => setShowTransferOwnership(!showTransferOwnership)}
                    className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded text-sm transition-colors">
                    <ArrowLeftRight className="w-4 h-4" /><span>Transfer Ownership</span>
                  </button>
                  {showTransferOwnership && (
                    <div className="mt-3 bg-gray-900 border border-gray-800 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-3">Select a member to transfer ownership to. You will become a manager.</p>
                      <div className="flex gap-3">
                        <select value={transferToId} onChange={e => setTransferToId(e.target.value)}
                          className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none">
                          <option value="">Select member...</option>
                          {garageMembers.filter(m => m.user_id !== user.id).map(m => (
                            <option key={m.id} value={m.user_id}>{m.profiles?.display_name || m.profiles?.email}</option>
                          ))}
                        </select>
                        <button onClick={transferOwnership} disabled={!transferToId}
                          className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded text-sm font-semibold transition-colors disabled:opacity-40">
                          Transfer
                        </button>
                        <button onClick={() => setShowTransferOwnership(false)} className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded text-sm">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                {garageMembers.map(m => (
                  <div key={m.id} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-white font-medium">
                        {m.profiles?.display_name || m.profiles?.email}
                        {m.user_id === user.id && <span className="text-gray-600 text-sm ml-2">(you)</span>}
                      </p>
                      <p className={`text-xs font-medium ${ROLE_COLORS[m.role]}`}>{ROLE_LABELS[m.role]}</p>
                    </div>
                    {myRole === 'owner' && m.user_id !== user.id && (
                      <div className="flex items-center gap-2">
                        <select value={m.role} onChange={e => updateMemberRole(m.id, e.target.value)}
                          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-300 text-sm focus:outline-none">
                          <option value="manager">Manager</option>
                          <option value="member">Member</option>
                        </select>
                        <button onClick={() => removeMember(m.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ============================
  // BIKE DETAIL VIEW
  // ============================
  if (view === 'bike-detail' && selectedBike && selectedGarage) {
    const upcoming = sortMaintenance(maintenanceTasks.filter(m => !m.completed), selectedBike);
    const completed = sortMaintenance(maintenanceTasks.filter(m => m.completed), selectedBike);
    const totalSpent = maintenanceTasks.filter(m => m.completed).reduce((s, m) => s + getTotalCost(m), 0);
    const editable = canEditBike(selectedBike);

    return (
      <div className="min-h-screen bg-black">
        <div className="bg-gray-900 border-b border-gray-800 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center text-sm text-gray-500 mb-4 space-x-2 flex-wrap">
              <button onClick={() => { setView('garages'); setSelectedGarage(null); setSelectedBike(null); }} className="hover:text-white transition-colors">Your Garages</button>
              <ChevronRight className="w-4 h-4" />
              <button onClick={() => { setView('garage-dashboard'); setSelectedBike(null); setActiveTab('bikes'); }} className="hover:text-white transition-colors">{selectedGarage.name}</button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-300">{selectedBike.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">{selectedBike.year} {selectedBike.name}</h1>
                <p className="text-gray-500">{selectedBike.model}</p>
                {!editable && <p className="text-yellow-600 text-xs mt-1 flex items-center gap-1"><ShieldCheck className="w-3 h-3" />View only — you can edit bikes you've added</p>}
              </div>
              {editable && (
                <button onClick={deleteBike} className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors">Delete Bike</button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border-b border-gray-800 px-4 py-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-500 text-sm mb-1">Current Mileage</p>
              <div className="flex items-end justify-between">
                <p className="text-white font-bold text-2xl">{selectedBike.current_mileage.toLocaleString()}</p>
                {editable && (
                  <button onClick={() => { setCurrentMileageInput(selectedBike.current_mileage.toString()); setShowUpdateMileage(true); }}
                    className="text-gray-400 hover:text-white text-xs font-semibold">Update</button>
                )}
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-500 text-sm mb-1">Maintenance Due</p>
              <p className="text-yellow-400 font-bold text-2xl">{upcoming.length}</p>
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

        {showUpdateMileage && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 w-full max-w-md">
              <h3 className="text-2xl font-bold text-white mb-6">Update Mileage</h3>
              <form onSubmit={handleUpdateMileage} className="space-y-4">
                <input type="number" value={currentMileageInput} onChange={e => setCurrentMileageInput(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-gray-500" />
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded">Update</button>
                  <button type="button" onClick={() => setShowUpdateMileage(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold py-2 rounded">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showTemplates && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 w-full max-w-md">
              <h3 className="text-2xl font-bold text-white mb-6">Load Template</h3>
              <div className="space-y-3">
                {Object.entries(MAINTENANCE_TEMPLATES).map(([key, t]) => (
                  <button key={key} onClick={() => applyTemplate(key)}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white text-left px-4 py-3 rounded transition-colors">
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-gray-500 text-sm">{t.tasks.length} tasks</p>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowTemplates(false)} className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold py-2 rounded mt-4">Cancel</button>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 py-8">
          {editable && (
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Maintenance Schedule</h2>
              <div className="flex gap-3">
                <button onClick={() => setShowTemplates(true)} className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded font-semibold transition-colors text-sm">
                  <Copy className="w-4 h-4" /><span>Load Template</span>
                </button>
                <button onClick={() => setShowAddMaintenance(true)} className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded font-semibold transition-colors">
                  <Plus className="w-5 h-5" /><span>Add Task</span>
                </button>
              </div>
            </div>
          )}

          {showAddMaintenance && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 w-full max-w-2xl my-8">
                <h3 className="text-2xl font-bold text-white mb-6">Add Maintenance Task</h3>
                <form onSubmit={handleAddMaintenance} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Task</label>
                    <input type="text" value={maintenanceTask} onChange={e => setMaintenanceTask(e.target.value)} placeholder="e.g., Oil change" required
                      className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Due Date (optional)</label>
                      <input type="date" value={maintenanceDueDate} onChange={e => setMaintenanceDueDate(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-gray-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Due Mileage (optional)</label>
                      <input type="number" value={maintenanceDueMileage} onChange={e => setMaintenanceDueMileage(e.target.value)} placeholder="e.g., 5000"
                        className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Parts Cost</label>
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-2">$</span>
                        <input type="number" value={maintenancePartsCost} onChange={e => setMaintenancePartsCost(e.target.value)} placeholder="0.00" step="0.01"
                          className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Labor Cost</label>
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-2">$</span>
                        <input type="number" value={maintenanceLaborCost} onChange={e => setMaintenanceLaborCost(e.target.value)} placeholder="0.00" step="0.01"
                          className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Notes</label>
                    <textarea value={maintenanceNotes} onChange={e => setMaintenanceNotes(e.target.value)} placeholder="Technician notes, parts used, etc." rows={3}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Photo (optional)</label>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600" />
                    {maintenancePhoto && <img src={maintenancePhoto} alt="preview" className="w-full h-40 object-cover rounded mt-3" />}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button type="submit" disabled={loading} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded disabled:opacity-50">
                      {loading ? 'Adding...' : 'Add Task'}</button>
                    <button type="button" onClick={() => { setShowAddMaintenance(false); setMaintenancePhoto(''); }}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold py-2 rounded">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="mb-12">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" /><span>Maintenance Due ({upcoming.length})</span>
            </h3>
            {upcoming.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-500">No pending maintenance tasks</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map(task => {
                  const isDue = isMaintenanceDue(task, selectedBike);
                  const mileageUntilDue = task.due_mileage ? task.due_mileage - selectedBike.current_mileage : null;
                  return (
                    <div key={task.id} className={`bg-gray-900 border rounded-lg p-4 ${isDue ? 'border-red-500 bg-red-950 bg-opacity-30' : 'border-gray-800'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-white font-semibold mb-2">{task.task}</h4>
                          <div className="flex flex-wrap gap-3 mb-2">
                            {task.due_mileage && (
                              <div className={`text-sm ${isDue ? 'text-red-400' : 'text-gray-500'}`}>
                                <span className="font-semibold">Mileage:</span> {task.due_mileage.toLocaleString()} mi
                                {mileageUntilDue !== null && (
                                  <span className={`ml-2 ${mileageUntilDue < 0 ? 'text-red-400' : 'text-gray-600'}`}>
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
                              {parseFloat(task.parts_cost) > 0 && <span>Parts: ${parseFloat(task.parts_cost).toFixed(2)} </span>}
                              {parseFloat(task.labor_cost) > 0 && <span>Labor: ${parseFloat(task.labor_cost).toFixed(2)} </span>}
                              <span className="font-semibold">Total: ${getTotalCost(task).toFixed(2)}</span>
                            </div>
                          )}
                          {task.notes && <p className="text-gray-500 text-sm">{task.notes}</p>}
                          {task.photo_url && <img src={task.photo_url} alt={task.task} className="w-full h-32 object-cover rounded mt-2" />}
                        </div>
                        {editable && (
                          <div className="flex items-center space-x-2 ml-4">
                            <button onClick={() => toggleComplete(task)} className="text-gray-500 hover:text-green-400 transition-colors">
                              <CheckCircle2 className="w-6 h-6" />
                            </button>
                            <button onClick={() => deleteTask(task.id)} className="text-gray-500 hover:text-red-400 transition-colors">✕</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {completed.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" /><span>Service History ({completed.length})</span>
              </h3>
              <div className="space-y-3">
                {completed.map(task => (
                  <div key={task.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4 opacity-80">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-gray-300 font-semibold mb-2">{task.task}</h4>
                        <div className="flex flex-wrap gap-3 mb-2">
                          <div className="text-sm text-gray-600">Completed: {new Date(task.completed_date).toLocaleDateString()}</div>
                          {task.completed_mileage && <div className="text-sm text-gray-600">at {task.completed_mileage.toLocaleString()} mi</div>}
                        </div>
                        {getTotalCost(task) > 0 && <div className="text-sm text-gray-600 mb-2"><DollarSign className="w-4 h-4 inline" />${getTotalCost(task).toFixed(2)}</div>}
                        {task.notes && <p className="text-gray-700 text-sm">{task.notes}</p>}
                        {task.photo_url && <img src={task.photo_url} alt={task.task} className="w-full h-32 object-cover rounded mt-2" />}
                      </div>
                      {editable && (
                        <div className="flex items-center space-x-2 ml-4">
                          <button onClick={() => toggleComplete(task)} className="text-gray-700 hover:text-yellow-400 transition-colors">
                            <CheckCircle2 className="w-6 h-6" />
                          </button>
                          <button onClick={() => deleteTask(task.id)} className="text-gray-700 hover:text-red-400 transition-colors">✕</button>
                        </div>
                      )}
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
