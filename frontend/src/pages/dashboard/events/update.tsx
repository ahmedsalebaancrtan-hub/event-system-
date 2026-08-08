import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import type { AppEvent } from "../../../types/event";
import { useEventStore } from "../../../store/event-store";

const inputCls = "block w-full px-4 py-3 rounded-xl text-sm outline-none transition-all";
const inputStyle = {
  background: 'rgba(74,0,78,0.03)',
  border: '1px solid rgba(212,175,55,0.3)',
  color: 'var(--plum)',
};

export const UpdateEvent = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { selectedEvent, fetchEventDetails, updateEvent } = useEventStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Partial<AppEvent>>({
    title: "", type: "CONFERENCE", location: "", capacity: 0, description: "", imgUrl: ""
  });
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    if (id) fetchEventDetails(id);
  }, [id, fetchEventDetails]);

  useEffect(() => {
    if (selectedEvent) {
      setFormData({
        title: selectedEvent.title, type: selectedEvent.type,
        location: selectedEvent.location, capacity: selectedEvent.capacity,
        description: selectedEvent.description, imgUrl: selectedEvent.imgUrl,
      });
      if (selectedEvent.startTime) setStartTime(new Date(selectedEvent.startTime).toISOString().slice(0, 16));
      if (selectedEvent.endTime) setEndTime(new Date(selectedEvent.endTime).toISOString().slice(0, 16));
    }
  }, [selectedEvent]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === "capacity" ? parseInt(value) || 0 : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsLoading(true);
    setError("");
    try {
      const payload: any = {
        ...formData,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        img_url: formData.imgUrl,
      };
      await updateEvent(id, payload);
      navigate(`/dashboard/directories/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update event.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to={`/dashboard/directories/${id}`}
          className="p-2 rounded-full transition-colors"
          style={{ background: 'white', border: '1px solid rgba(212,175,55,0.35)', color: 'var(--plum)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--magenta)'; (e.currentTarget as HTMLElement).style.color = 'var(--magenta)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.35)'; (e.currentTarget as HTMLElement).style.color = 'var(--plum)'; }}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-luxury text-3xl font-bold" style={{ color: 'var(--plum)' }}>Update Event</h1>
          <div className="h-0.5 w-12 mt-2" style={{ background: 'linear-gradient(90deg, var(--gold), var(--magenta))' }}></div>
          <p className="text-gray-500 mt-2 text-sm">Modify the details of your event below.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl text-red-600" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      <div className="bg-white" style={{ borderRadius: '24px', border: '1px solid rgba(212,175,55,0.25)', boxShadow: '0 4px 24px rgba(74,0,78,0.08)' }}>
        <div className="h-1 rounded-t-[24px]" style={{ background: 'linear-gradient(90deg, var(--plum-dark), var(--magenta), var(--gold))' }}></div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--plum)' }}>
                Event Title <span style={{ color: 'var(--magenta)' }}>*</span>
              </label>
              <input id="title" name="title" type="text" required value={formData.title || ""}
                onChange={handleChange} className={inputCls} style={inputStyle}
                onFocus={e => (e.target.style.border = '1px solid var(--magenta)')}
                onBlur={e => (e.target.style.border = '1px solid rgba(212,175,55,0.3)')}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--plum)' }}>
                Event Type <span style={{ color: 'var(--magenta)' }}>*</span>
              </label>
              <select id="type" name="type" required value={formData.type || "CONFERENCE"}
                onChange={handleChange} className={`${inputCls} appearance-none`} style={inputStyle}
                onFocus={e => (e.target.style.border = '1px solid var(--magenta)')}
                onBlur={e => (e.target.style.border = '1px solid rgba(212,175,55,0.3)')}>
                <option value="CONFERENCE">Conference</option>
                <option value="SEMINAR">Seminar</option>
                <option value="WORKSHOP">Workshop</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--plum)' }}>Location <span style={{ color: 'var(--magenta)' }}>*</span></label>
              <input id="location" name="location" type="text" required value={formData.location || ""}
                onChange={handleChange} className={inputCls} style={inputStyle}
                onFocus={e => (e.target.style.border = '1px solid var(--magenta)')}
                onBlur={e => (e.target.style.border = '1px solid rgba(212,175,55,0.3)')}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--plum)' }}>Start Date & Time <span style={{ color: 'var(--magenta)' }}>*</span></label>
              <input id="start_time" name="start_time" type="datetime-local" required value={startTime}
                onChange={e => setStartTime(e.target.value)} className={inputCls} style={inputStyle}
                onFocus={e => (e.target.style.border = '1px solid var(--magenta)')}
                onBlur={e => (e.target.style.border = '1px solid rgba(212,175,55,0.3)')}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--plum)' }}>End Date & Time <span style={{ color: 'var(--magenta)' }}>*</span></label>
              <input id="end_time" name="end_time" type="datetime-local" required value={endTime}
                onChange={e => setEndTime(e.target.value)} className={inputCls} style={inputStyle}
                onFocus={e => (e.target.style.border = '1px solid var(--magenta)')}
                onBlur={e => (e.target.style.border = '1px solid rgba(212,175,55,0.3)')}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--plum)' }}>Attendee Capacity <span style={{ color: 'var(--magenta)' }}>*</span></label>
              <input id="capacity" name="capacity" type="number" min="1" required value={formData.capacity || 0}
                onChange={handleChange} className={inputCls} style={inputStyle}
                onFocus={e => (e.target.style.border = '1px solid var(--magenta)')}
                onBlur={e => (e.target.style.border = '1px solid rgba(212,175,55,0.3)')}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--plum)' }}>Cover Image URL</label>
              <input id="imgUrl" name="imgUrl" type="url" value={formData.imgUrl || ""}
                onChange={handleChange} className={inputCls} style={inputStyle}
                placeholder="https://example.com/image.jpg"
                onFocus={e => (e.target.style.border = '1px solid var(--magenta)')}
                onBlur={e => (e.target.style.border = '1px solid rgba(212,175,55,0.3)')}
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--plum)' }}>Description</label>
              <textarea id="description" name="description" rows={4} value={formData.description || ""}
                onChange={handleChange} className={`${inputCls} resize-none`} style={inputStyle}
                onFocus={e => (e.target.style.border = '1px solid var(--magenta)')}
                onBlur={e => (e.target.style.border = '1px solid rgba(212,175,55,0.3)')}
              />
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-4" style={{ borderTop: '1px solid rgba(212,175,55,0.2)' }}>
            <Link to={`/dashboard/directories/${id}`}
              className="px-6 py-3 rounded-xl font-medium transition-colors"
              style={{ background: 'rgba(74,0,78,0.05)', color: 'var(--plum)', border: '1px solid rgba(74,0,78,0.15)' }}>
              Cancel
            </Link>
            <button type="submit" disabled={isLoading}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-medium text-white hover:scale-105 disabled:opacity-70 transition-all"
              style={{ background: `linear-gradient(135deg, var(--plum), var(--magenta))`, boxShadow: '0 4px 15px rgba(189,3,166,0.3)', border: '1px solid rgba(212,175,55,0.3)' }}>
              <Save className="w-5 h-5" style={{ color: 'var(--gold-light)' }} />
              {isLoading ? "Saving..." : "Update Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
