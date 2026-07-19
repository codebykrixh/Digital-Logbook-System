'use client';

import * as React from 'react';
import { Send, X, AtSign, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoiceTextarea } from '@/components/ui/voice-textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { CommentDto } from '@/types/event';
import type { OrgUser } from '@/types/org';

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

interface CommentThreadProps {
  comments: CommentDto[];
  orgUsers: OrgUser[];
  currentUserId?: string;
  currentUserRole?: string;
  onAdd: (body: string, mentionedUserIds: string[]) => Promise<unknown>;
  onRemove: (commentId: string) => Promise<unknown>;
}

export function CommentThread({
  comments,
  orgUsers,
  currentUserId,
  currentUserRole,
  onAdd,
  onRemove,
}: CommentThreadProps) {
  const [body, setBody] = React.useState('');
  const [mentioned, setMentioned] = React.useState<OrgUser[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  const toggleMention = (user: OrgUser) => {
    setMentioned((prev) =>
      prev.some((u) => u.id === user.id) ? prev.filter((u) => u.id !== user.id) : [...prev, user]
    );
  };

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      await onAdd(body.trim(), mentioned.map((u) => u.id));
      setBody('');
      setMentioned([]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {comments.length > 0 && (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-3 rounded-xl border bg-background p-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-semibold text-white">
                {c.author.firstName[0]}
                {c.author.lastName[0]}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">
                    {c.author.firstName} {c.author.lastName}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {timeAgo(c.createdAt)}
                    </span>
                  </p>
                  {(c.author.id === currentUserId || currentUserRole === 'ADMIN') && (
                    <button
                      onClick={() => onRemove(c.id)}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                      aria-label="Delete comment"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{c.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-2">
        <VoiceTextarea
          value={body}
          onChange={setBody}
          placeholder="Add a comment… or tap the mic to dictate"
          className="min-h-[70px]"
        />
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" type="button">
                <AtSign className="h-3.5 w-3.5" />
                Mention
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
              {orgUsers.map((u) => (
                <DropdownMenuItem key={u.id} onClick={() => toggleMention(u)}>
                  {u.firstName} {u.lastName}
                  <span className="ml-auto text-xs text-muted-foreground">{u.role}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {mentioned.map((u) => (
            <span
              key={u.id}
              className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium"
            >
              @{u.firstName}
              <button onClick={() => toggleMention(u)} aria-label={`Remove ${u.firstName}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          <Button
            size="sm"
            variant="gradient"
            className="ml-auto"
            onClick={handleSubmit}
            disabled={!body.trim() || submitting}
          >
            <Send className="h-3.5 w-3.5" />
            Post
          </Button>
        </div>
      </div>
    </div>
  );
}
