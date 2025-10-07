"use client";

import type { CalendarNote } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarNoteCardProps {
  note: CalendarNote;
  onEdit: (note: CalendarNote) => void;
  onDelete: (noteId: string) => void;
  onToggleComplete: (isCompleted: boolean) => void;
}

export function CalendarNoteCard({
  note,
  onEdit,
  onDelete,
  onToggleComplete,
}: CalendarNoteCardProps) {
  return (
    <Card className="shadow-sm bg-secondary/30 hover:shadow-md transition-shadow">
      <CardContent className="p-3 flex items-start gap-3">
        <Checkbox
          id={`note-${note.id}`}
          checked={note.isCompleted}
          onCheckedChange={onToggleComplete}
          className="mt-1"
        />
        <label
          htmlFor={`note-${note.id}`}
          className={cn(
            "flex-grow text-sm transition-colors",
            note.isCompleted
              ? "text-muted-foreground line-through"
              : "text-foreground"
          )}
        >
          {note.title}
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Действия с заметкой</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(note)}>
              <Edit className="mr-2 h-4 w-4" />
              Редактировать
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(note.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
