import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { EmptyState, ErrorState, Skeletons } from "@/components/CustomerShell";
import { sendSupportMessage, useCustomerData } from "@/lib/customer-data";

export const Route = createFileRoute("/customer/messages")({
  component: CustomerMessages,
});

function CustomerMessages() {
  const { data, loading, error, reload } = useCustomerData();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  if (error) return <ErrorState message={error} onRetry={() => void reload()} />;

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    await sendSupportMessage(text.trim());
    setText("");
    await reload();
    setSending(false);
  };

  return (
    <div className="cd-page">
      <div className="pd-page-head">
        <div>
          <h1>Messages</h1>
          <p>Chat with your service provider and the CleanConnect team.</p>
        </div>
      </div>

      <section className="pd-panel">
        {loading ? (
          <Skeletons rows={4} />
        ) : data.messages.length === 0 ? (
          <EmptyState
            icon="fa-comments"
            title="No messages yet"
            body="Once you book a service you can chat with your provider right here."
          />
        ) : (
          <ul className="cd-chat">
            {[...data.messages].reverse().map((m) => (
              <li key={m.id} className={m.sender_id === data.profile?.id ? "is-me" : ""}>
                <p>{m.body}</p>
                <em>{new Date(m.created_at).toLocaleString()}</em>
              </li>
            ))}
          </ul>
        )}

        <form className="cd-chat-form" onSubmit={send}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            aria-label="Message"
          />
          <button type="submit" className="pd-btn pd-btn-primary" disabled={sending}>
            <i className="fas fa-paper-plane" /> Send
          </button>
        </form>
      </section>
    </div>
  );
}
