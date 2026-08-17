import React, { useState } from 'react';
import {
  MessageSquare, Plus, Check, Reply, Trash2, User,
  AtSign, Clock, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface CommentItem {
  id: string;
  author: string;
  authorAvatar?: string;
  timestamp: number;
  text: string;
  resolved: boolean;
  replies?: { id: string; author: string; timestamp: number; text: string }[];
}

interface CommentsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
}

export function CommentsSidebar({
  isOpen,
  onClose,
  documentId,
}: CommentsSidebarProps) {
  const [comments, setComments] = useState<CommentItem[]>([
    {
      id: 'c1',
      author: 'Dr. Sarah Jenkins',
      timestamp: Date.now() - 1000 * 60 * 35,
      text: 'Please ensure all citations in Section 3 follow the IEEE format and include DOI numbers.',
      resolved: false,
      replies: [
        {
          id: 'r1',
          author: 'Alex Chen',
          timestamp: Date.now() - 1000 * 60 * 15,
          text: 'Verified and updated with 2026 references.',
        },
      ],
    },
    {
      id: 'c2',
      author: 'Marcus Vance',
      timestamp: Date.now() - 1000 * 60 * 90,
      text: '@Alex The executive summary metrics look great! Can we bold the 87% efficiency figure?',
      resolved: true,
    },
  ]);

  const [newCommentText, setNewCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  if (!isOpen) return null;

  const handleAddComment = () => {
    if (!newCommentText.trim()) return;
    const item: CommentItem = {
      id: `c_${Date.now()}`,
      author: 'You (Editor)',
      timestamp: Date.now(),
      text: newCommentText.trim(),
      resolved: false,
      replies: [],
    };
    setComments([item, ...comments]);
    setNewCommentText('');
  };

  const handleToggleResolve = (id: string) => {
    setComments(comments.map(c => c.id === id ? { ...c, resolved: !c.resolved } : c));
  };

  const handleDeleteComment = (id: string) => {
    setComments(comments.filter(c => c.id !== id));
  };

  const handleAddReply = (commentId: string) => {
    if (!replyText.trim()) return;
    setComments(comments.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: [
            ...(c.replies || []),
            {
              id: `r_${Date.now()}`,
              author: 'You (Editor)',
              timestamp: Date.now(),
              text: replyText.trim(),
            },
          ],
        };
      }
      return c;
    }));
    setReplyText('');
    setReplyingToId(null);
  };

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col h-full shrink-0 select-none text-xs z-30 shadow-xl">
      {/* Sidebar Header */}
      <div className="h-11 px-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <MessageSquare className="h-4 w-4 text-primary" />
          <span>Comments &amp; Review</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Add New Comment Box */}
      <div className="p-3 border-b border-border space-y-2 bg-muted/20">
        <Input
          value={newCommentText}
          onChange={e => setNewCommentText(e.target.value)}
          placeholder="Add a comment or @mention a collaborator..."
          className="h-8 text-xs bg-background"
          onKeyDown={e => e.key === 'Enter' && handleAddComment()}
        />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Type @ to mention</span>
          <Button
            size="sm"
            onClick={handleAddComment}
            disabled={!newCommentText.trim()}
            className="h-6 px-2.5 text-[11px] bg-primary"
          >
            Post
          </Button>
        </div>
      </div>

      {/* Comments Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {comments.map(c => (
          <div
            key={c.id}
            className={`p-3 rounded-lg border transition-all ${
              c.resolved
                ? 'border-border/40 bg-muted/30 opacity-70'
                : 'border-border bg-background shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                  {c.author.charAt(0)}
                </div>
                <span className="font-semibold text-xs text-foreground truncate max-w-[120px]">{c.author}</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">
                {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <p className="text-xs text-foreground/90 mt-1 leading-relaxed select-text">{c.text}</p>

            {/* Replies */}
            {c.replies && c.replies.length > 0 && (
              <div className="mt-2 pl-3 border-l-2 border-primary/30 space-y-1.5">
                {c.replies.map(r => (
                  <div key={r.id} className="text-[11px]">
                    <span className="font-semibold text-foreground">{r.author}: </span>
                    <span className="text-muted-foreground select-text">{r.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Inline Reply Input */}
            {replyingToId === c.id && (
              <div className="mt-2 pt-2 border-t border-border flex items-center gap-1">
                <Input
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="h-6 text-[11px] flex-1"
                  onKeyDown={e => e.key === 'Enter' && handleAddReply(c.id)}
                  autoFocus
                />
                <Button size="sm" onClick={() => handleAddReply(c.id)} className="h-6 px-2 text-[10px]">
                  Reply
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReplyingToId(replyingToId === c.id ? null : c.id)}
                  className="hover:text-primary transition-colors flex items-center gap-0.5 text-muted-foreground"
                >
                  <Reply className="h-3 w-3" /> Reply
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleResolve(c.id)}
                  className={`flex items-center gap-0.5 transition-colors ${c.resolved ? 'text-emerald-600 font-semibold' : 'text-muted-foreground hover:text-emerald-600'}`}
                >
                  <Check className="h-3 w-3" /> {c.resolved ? 'Resolved' : 'Resolve'}
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteComment(c.id)}
                className="text-muted-foreground hover:text-destructive transition-colors p-0.5"
                title="Delete comment"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
