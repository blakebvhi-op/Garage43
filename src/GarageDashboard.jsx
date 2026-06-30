import React, { useState, useRef } from 'react';
import {
  Settings, GripVertical, Eye, EyeOff, X, AlertCircle,
  CheckCircle2, MessageSquare, Users, Calendar, Bike as BikeIcon,
  Pin, Clock, ChevronRight
} from 'lucide-react';

const WIDGET_META = {
  maintenance: { label: 'Bikes with Maintenance Due', icon: AlertCircle, color: 'text-yellow-400' },
  schedule:    { label: "This Week's Lift Schedule",  icon: Calendar,     color: 'text-blue-400'   },
  posts:       { label: 'Recent Board Posts',          icon: MessageSquare,color: 'text-gray-300'   },
  members:     { label: 'Member List',                 icon: Users,        color: 'text-green-400'  },
};

const DEFAULT_LAYOUT = [
  { id: 'maintenance', enabled: true },
  { id: 'schedule',    enabled: true },
  { id: 'posts',       enabled: true },
  { id: 'members',     enabled: true },
];

function parseLayout(raw) {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {}
  return DEFAULT_LAYOUT;
}

// ── Drag-to-reorder list ──────────────────────────────────────────────
function SortableWidget({ item, index, onToggle, onDragStart, onDragOver, onDrop }) {
  const meta = WIDGET_META[item.id];
  const Icon = meta.icon;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={e => { e.preventDefault(); onDragOver(index); }}
      onDrop={() => onDrop(index)}
      className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 cursor-grab active:cursor-grabbing select-none"
    >
      <GripVertical className="w-4 h-4 text-gray-600 shrink-0" />
      <Icon className={`w-4 h-4 shrink-0 ${meta.color}`} />
      <span className="text-white text-sm flex-1">{meta.label}</span>
      <button
        onClick={() => onToggle(index)}
        className={`transition-colors ${item.enabled ? 'text-green-400 hover:text-gray-400' : 'text-gray-600 hover:text-green-400'}`}
        title={item.enabled ? 'Hide widget' : 'Show widget'}
      >
        {item.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>
    </div>
  );
}

// ── Widget: Bikes with Maintenance Due ───────────────────────────────
function MaintenanceWidget({ bikes, onBikeClick }) {
  const dueBikes = bikes.filter(bike => {
    const tasks = bike.maintenance_tasks || [];
    const now = new Date();
    return tasks.some(t => {
      if (t.completed) return false;
      const dueDate = t.due_date ? new Date(t.due_date) : null;
      return (dueDate && dueDate <= now) || (t.due_mileage && t.due_mileage <= bike.current_mileage);
    });
  });

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-yellow-400" />
        <h3 className="text-white font-bold">Maintenance Due</h3>
        {dueBikes.length > 0 && (
          <span className="ml-auto bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">{dueBikes.length}</span>
        )}
      </div>
      {dueBikes.length === 0 ? (
        <div className="flex items-center gap-2 text-green-400 text-sm">
          <CheckCircle2 className="w-4 h-4" /><span>All bikes are current</span>
        </div>
      ) : (
        <div className="space-y-2">
          {dueBikes.map(bike => {
            const overdueTasks = (bike.maintenance_tasks || []).filter(t => {
              if (t.completed) return false;
              const dueDate = t.due_date ? new Date(t.due_date) : null;
              return (dueDate && dueDate <= new Date()) || (t.due_mileage && t.due_mileage <= bike.current_mileage);
            });
            return (
              <button
                key={bike.id}
                onClick={() => onBikeClick(bike)}
                className="w-full flex items-center justify-between bg-gray-800 hover:bg-gray-700 rounded-lg px-4 py-3 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <BikeIcon className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-white text-sm font-medium">{bike.year} {bike.name}</p>
                    <p className="text-gray-500 text-xs">{bike.current_mileage.toLocaleString()} mi</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-400 text-xs font-medium">{overdueTasks.length} overdue</span>
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Widget: This Week's Lift Schedule ────────────────────────────────
function ScheduleWidget({ liftBookings }) {
  const now = new Date();
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6);

  const thisWeek = liftBookings.filter(b => {
    const d = new Date(b.booking_date + 'T12:00:00');
    return d >= weekStart && d <= weekEnd && b.status === 'approved';
  });

  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hr = parseInt(h);
    return `${hr % 12 || 12}:${m} ${hr < 12 ? 'AM' : 'PM'}`;
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-blue-400" />
        <h3 className="text-white font-bold">This Week's Lifts</h3>
        <span className="ml-auto text-gray-600 text-xs">
          {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
      {thisWeek.length === 0 ? (
        <p className="text-gray-500 text-sm">No approved bookings this week.</p>
      ) : (
        <div className="space-y-2">
          {thisWeek.map(b => (
            <div key={b.id} className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-3">
              <div className={`text-xs font-bold px-2 py-1 rounded bg-gray-700 ${b.lift_number === 1 ? 'text-blue-400' : 'text-purple-400'}`}>
                L{b.lift_number}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {b.bikes ? `${b.bikes.year} ${b.bikes.name}` : 'Unspecified bike'}
                </p>
                <p className="text-gray-500 text-xs">
                  {new Date(b.booking_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  {b.all_day ? ' · All day' : b.start_time ? ` · ${formatTime(b.start_time)}${b.end_time ? ` – ${formatTime(b.end_time)}` : ''}` : ''}
                </p>
              </div>
              {b.note && <p className="text-gray-600 text-xs truncate max-w-24" title={b.note}>"{b.note}"</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Widget: Recent Board Posts ───────────────────────────────────────
function PostsWidget({ posts, onViewBoard }) {
  const recent = [...posts].sort((a, b) => {
    if (a.pinned !== b.pinned) return b.pinned - a.pinned;
    return new Date(b.updated_at) - new Date(a.updated_at);
  }).slice(0, 4);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-gray-300" />
        <h3 className="text-white font-bold">Recent Posts</h3>
        <button onClick={onViewBoard} className="ml-auto text-gray-500 hover:text-white text-xs transition-colors">
          View all →
        </button>
      </div>
      {recent.length === 0 ? (
        <p className="text-gray-500 text-sm">No posts yet.</p>
      ) : (
        <div className="space-y-3">
          {recent.map(post => (
            <div key={post.id} className="border-l-2 border-gray-700 pl-3">
              {post.pinned && (
                <div className="flex items-center gap-1 text-yellow-500 text-xs mb-1">
                  <Pin className="w-3 h-3" /><span>Pinned</span>
                </div>
              )}
              <p className="text-gray-300 text-sm line-clamp-2">{post.body}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                <span>{post.profiles?.display_name || post.profiles?.email}</span>
                <span>·</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                {(post.garage_replies?.length || 0) > 0 && (
                  <>
                    <span>·</span>
                    <span>{post.garage_replies.length} {post.garage_replies.length === 1 ? 'reply' : 'replies'}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Widget: Member List ──────────────────────────────────────────────
const ROLE_COLORS = { owner: 'text-yellow-400', manager: 'text-blue-400', member: 'text-gray-400' };
const ROLE_LABELS = { owner: 'Owner', manager: 'Manager', member: 'Member' };

function MembersWidget({ members }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-green-400" />
        <h3 className="text-white font-bold">Members</h3>
        <span className="ml-auto text-gray-600 text-xs">{members.length} total</span>
      </div>
      <div className="space-y-2">
        {members.map(m => (
          <div key={m.id} className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 text-xs font-bold shrink-0">
              {(m.profiles?.display_name || m.profiles?.email || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate">{m.profiles?.display_name || m.profiles?.email}</p>
            </div>
            <span className={`text-xs font-medium shrink-0 ${ROLE_COLORS[m.role]}`}>{ROLE_LABELS[m.role]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Dashboard Component ─────────────────────────────────────────
export default function GarageDashboard({
  garage, myRole, bikes, liftBookings, posts, members,
  onBikeClick, onViewBoard, onLayoutSave
}) {
  const [layout, setLayout] = useState(parseLayout(garage.dashboard_layout));
  const [editing, setEditing] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const isPrivileged = myRole === 'owner' || myRole === 'manager';

  const handleToggle = (index) => {
    const updated = layout.map((item, i) => i === index ? { ...item, enabled: !item.enabled } : item);
    setLayout(updated);
  };

  const handleDragStart = (index) => setDragIndex(index);

  const handleDragOver = (index) => {
    if (dragIndex === null || dragIndex === index) return;
    const updated = [...layout];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);
    setLayout(updated);
    setDragIndex(index);
  };

  const handleDrop = () => setDragIndex(null);

  const handleSave = async () => {
    await onLayoutSave(layout);
    setEditing(false);
  };

  const handleCancel = () => {
    setLayout(parseLayout(garage.dashboard_layout));
    setEditing(false);
  };

  const enabledWidgets = layout.filter(w => w.enabled);

  return (
    <div>
      {/* Dashboard header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        {isPrivileged && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Customize</span>
          </button>
        )}
      </div>

      {/* Customize panel */}
      {editing && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Customize Dashboard</h3>
            <button onClick={handleCancel} className="text-gray-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-500 text-sm mb-4">Drag to reorder. Toggle the eye icon to show or hide widgets. All members see this layout.</p>
          <div className="space-y-2 mb-6">
            {layout.map((item, index) => (
              <SortableWidget
                key={item.id}
                item={item}
                index={index}
                onToggle={handleToggle}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded transition-colors">
              Save Layout
            </button>
            <button onClick={handleCancel} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-2 rounded transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Widget grid */}
      {enabledWidgets.length === 0 ? (
        <div className="text-center py-16">
          <Settings className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500">No widgets enabled. {isPrivileged ? 'Click Customize to add some.' : 'Ask an owner or manager to configure the dashboard.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {enabledWidgets.map(w => {
            switch (w.id) {
              case 'maintenance': return <MaintenanceWidget key="maintenance" bikes={bikes} onBikeClick={onBikeClick} />;
              case 'schedule':    return <ScheduleWidget key="schedule" liftBookings={liftBookings} />;
              case 'posts':       return <PostsWidget key="posts" posts={posts} onViewBoard={onViewBoard} />;
              case 'members':     return <MembersWidget key="members" members={members} />;
              default: return null;
            }
          })}
        </div>
      )}
    </div>
  );
}
