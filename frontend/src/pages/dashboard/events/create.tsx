import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import type { CreateEventDTO } from "../../../types/event";
import { api } from "../../../services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const CreateEvent = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<CreateEventDTO>({
    title: "",
    type: "CONFERENCE",
    location: "",
    start_time: "",
    end_time: "",
    capacity: 0,
    description: "",
    img_url: "",
    auto_approve: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = e.target instanceof HTMLInputElement ? e.target.checked : false;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : name === "capacity" ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const payload: CreateEventDTO = {
        ...formData,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
      };
      await api.post("/events/create", payload);
      navigate("/dashboard/directories");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || "Failed to create event. Please verify your inputs.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button id="back-btn" asChild variant="outline" size="icon" className="rounded-full shrink-0">
          <Link to="/dashboard/directories">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create New Event</h1>
          <div className="h-1 w-10 mt-2 rounded-full bg-gradient-to-r from-primary to-primary/40" />
          <p className="text-muted-foreground mt-1 text-sm">Fill out the details below to register a new event.</p>
        </div>
      </div>

      {/* Error banner */}
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

              {/* Event Title */}
              <div className="col-span-1 md:col-span-2 space-y-1.5">
                <Label htmlFor="title">Event Title <span className="text-destructive">*</span></Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Annual Tech Summit 2026"
                />
              </div>

              {/* Event Type */}
              <div className="space-y-1.5">
                <Label htmlFor="type">Event Type <span className="text-destructive">*</span></Label>
                <Select
                  value={formData.type}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, type: val as CreateEventDTO["type"] }))}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONFERENCE">Conference</SelectItem>
                    <SelectItem value="SEMINAR">Seminar</SelectItem>
                    <SelectItem value="WORKSHOP">Workshop</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <Label htmlFor="location">Location <span className="text-destructive">*</span></Label>
                <Input
                  id="location"
                  name="location"
                  type="text"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Grand Hotel Ballroom"
                />
              </div>

              {/* Start Time */}
              <div className="space-y-1.5">
                <Label htmlFor="start_time">Start Date & Time <span className="text-destructive">*</span></Label>
                <Input
                  id="start_time"
                  name="start_time"
                  type="datetime-local"
                  required
                  value={formData.start_time}
                  onChange={handleChange}
                />
              </div>

              {/* End Time */}
              <div className="space-y-1.5">
                <Label htmlFor="end_time">End Date & Time <span className="text-destructive">*</span></Label>
                <Input
                  id="end_time"
                  name="end_time"
                  type="datetime-local"
                  required
                  value={formData.end_time}
                  onChange={handleChange}
                />
              </div>

              {/* Capacity */}
              <div className="space-y-1.5">
                <Label htmlFor="capacity">Attendee Capacity <span className="text-destructive">*</span></Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  required
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="e.g. 500"
                />
              </div>

              {/* Image URL */}
              <div className="space-y-1.5">
                <Label htmlFor="img_url">Cover Image URL</Label>
                <Input
                  id="img_url"
                  name="img_url"
                  type="url"
                  value={formData.img_url}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Auto Approve Toggle */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border/50">
                  <div>
                    <p className="font-semibold text-sm text-foreground">Enable Auto-Approval</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Automatically approve new registrations without manual review</p>
                  </div>
                  <Switch
                    id="auto_approve"
                    checked={formData.auto_approve}
                    onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, auto_approve: checked }))}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="col-span-1 md:col-span-2 space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide details about the event agenda, speakers, and other relevant information..."
                />
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-4 border-t border-border/40">
              <Button id="cancel-btn" asChild variant="outline">
                <Link to="/dashboard/directories">Cancel</Link>
              </Button>
              <Button id="submit-btn" type="submit" disabled={isLoading} className="gap-2">
                <Save className="w-5 h-5" />
                {isLoading ? "Saving..." : "Create Event"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
