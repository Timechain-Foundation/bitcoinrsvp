import React, { useEffect, useState } from "react";
import { Bitcoin, Calendar, MapPin, Plus, Pencil, Trash2 } from "lucide-react";
import styles from "./EventManagement.module.css";
import classNames from "classnames";
import { createEvent, getEvents } from "../../sdk";

interface Event {
  id: string;
  name: string;
  description: string;
  location: string;
  date: string;
}

// TODO: Change this to be dynamic
const GROUP_ID = 1;

function EventManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    date: "",
  });

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: Event = {
      id: Date.now().toString(),
      ...formData,
    };

    await createEvent(GROUP_ID, formData);
    setEvents([...events, newEvent]);
    setFormData({ name: "", description: "", location: "", date: "" });
    setIsCreating(false);
  };

  const handleUpdateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    setEvents(
      events.map((event) =>
        event.id === editingEvent.id ? { ...event, ...formData } : event
      )
    );
    setEditingEvent(null);
    setFormData({ name: "", description: "", location: "", date: "" });
  };

  const handleEditClick = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      description: event.description,
      location: event.location,
      date: new Date(event.date).toISOString().slice(0, 16),
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setEvents(events.filter((event) => event.id !== eventId));
    }
  };

  useEffect(() => {
    (async () => {
      let events = await getEvents(GROUP_ID);
      setEvents(events);
    })();
  }, []);

  const renderEventForm = () => (
    <form
      onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
      className={styles.form}
    >
      <div>
        <label htmlFor="name" className={styles.label}>
          Event Name
        </label>
        <input
          type="text"
          id="name"
          required
          className={styles.input}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="description" className={styles.label}>
          Description
        </label>
        <textarea
          id="description"
          required
          rows={4}
          className={styles.input}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>

      <div>
        <label htmlFor="location" className={styles.label}>
          Location
        </label>
        <input
          type="text"
          id="location"
          required
          className={styles.input}
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
        />
      </div>

      <div>
        <label htmlFor="date" className={styles.label}>
          Date and Time
        </label>
        <input
          type="datetime-local"
          id="date"
          required
          className={classNames(styles.input, styles.inputDate)}
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        />
      </div>

      <div className={styles.buttonGroup}>
        <button
          type="button"
          onClick={() => {
            setIsCreating(false);
            setEditingEvent(null);
            setFormData({ name: "", description: "", location: "", date: "" });
          }}
          className={styles.cancelButton}
        >
          Cancel
        </button>
        <button type="submit" className={styles.submitButton}>
          {editingEvent ? "Update Event" : "Create Event"}
        </button>
      </div>
    </form>
  );

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {!isCreating && !editingEvent && (
          <button
            onClick={() => setIsCreating(true)}
            className={styles.createButton}
          >
            <Plus className={styles.iconSmall} />
            Create New Event
          </button>
        )}

        {(isCreating || editingEvent) && renderEventForm()}

        {!isCreating && !editingEvent && (
          <div className={styles.cardGrid}>
            {events.map((event) => (
              <div key={event.id} className={styles.card}>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{event.name}</h3>
                  <p className={styles.cardDescription}>{event.description}</p>
                  <div className={styles.cardMeta}>
                    <div className={styles.metaItem}>
                      <Calendar className={styles.iconSmall} />
                      <span>{new Date(event.date).toLocaleString()}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <MapPin className={styles.iconSmall} />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <button
                    onClick={() => handleEditClick(event)}
                    className={styles.actionButton}
                  >
                    <Pencil className={styles.iconSmall} />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className={styles.deleteButton}
                  >
                    <Trash2 className={styles.iconSmall} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default EventManagement;
