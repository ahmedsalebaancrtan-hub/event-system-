import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import type { AppEvent } from "../../../types/event";
import { useEventStore } from "../../../store/event-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const UpdateEvent = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { selectedEvent, fetchEventDetails, updateEvent } = useEventStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Partial<AppEvent>>({
    title: "", type: "CONFERENCE", location: "", capacity: 0, description: "", imgUrl: "", auto_approve: false
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
        auto_approve: Boolean(selectedEvent.auto_approve),
      });
      if (selectedEvent.startTime) setStartTime(new Date(selectedEvent.startTime).toISOString().slice(0, 16));
      if (selectedEvent.endTime) setEndTime(new Date(selectedEvent.endTime).toISOString().slice(0, 16));
    }
  }, [selectedEvent]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === "capacity" ? parseInt(value) || 0 : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsLoading(true);
    setError("");
    try {
      const payload = {
        ...formData,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        img_url: formData.imgUrl,
      };
      await updateEvent(id, payload);
      navigate(`/dashboard/directories/${id}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || "Failed to update event.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button id="back-btn" asChild variant="outline" size="icon" className="rounded-full shrink-0">
          <Link to={`/dashboard/directories/${id}`}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Update Event</h1>
          <div className="h-1 w-10 mt-2 rounded-full bg-gradient-to-r from-primary to-primary/40" />
          <p className="text-muted-foreground mt-1 text-sm">Modify the details of your event below.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary via-primary/70 to-yellow-400" />
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="col-span-1 md:col-span-2 space-y-1.5">
                <Label htmlFor="title">Event Title <span className="text-destructive">*</span></Label>
                <Input id="title" name="title" type="text" required value={formData.title || ""} onChange={handleChange} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="type">Event Type <span className="text-destructive">*</span></Label>
                <Select
                  value={formData.type || "CONFERENCE"}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, type: val as AppEvent["type"] }))}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONFERENCE">Conference</SelectItem>
                    <SelectItem value="SEMINAR">Seminar</SelectItem>
                    <SelectItem value="WORKSHOP">Workshop</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location">Location <span className="text-destructive">*</span></Label>
                <Input id="location" name="location" type="text" required value={formData.location || ""} onChange={handleChange} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="start_time">Start Date & Time <span className="text-destructive">*</span></Label>
                <Input
                  id="start_time"
                  name="start_time"
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartTime(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="end_time">End Date & Time <span className="text-destructive">*</span></Label>
                <Input
                  id="end_time"
                  name="end_time"
                  type="datetime-local"
                  required
                  value={endTime}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndTime(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="capacity">Attendee Capacity <span className="text-destructive">*</span></Label>
                <Input id="capacity" name="capacity" type="number" min="1" required value={formData.capacity || 0} onChange={handleChange} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="imgUrl">Cover Image URL</Label>
                <Input
                  id="imgUrl"
                  name="imgUrl"
                  type="url"
                  value={formData.imgUrl || ""}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border/50">
                  <div>
                    <p className="font-semibold text-sm text-foreground">Enable Auto-Approval</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Automatically approve new registrations without manual review</p>
                  </div>
                  <Switch
                    id="auto_approve"
                    checked={Boolean(formData.auto_approve)}
                    onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, auto_approve: checked }))}
                  />
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description || ""}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-4 border-t border-border/40">
              <Button id="cancel-btn" asChild variant="outline">
                <Link to={`/dashboard/directories/${id}`}>Cancel</Link>
              </Button>
              <Button id="submit-btn" type="submit" disabled={isLoading} className="gap-2">
                <Save className="w-5 h-5" />
                {isLoading ? "Saving..." : "Update Event"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
