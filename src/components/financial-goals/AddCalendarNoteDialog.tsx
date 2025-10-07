"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar as CalendarIcon,
  Save,
  NotebookPen,
  Loader2,
} from "lucide-react";
import { useBudgetStore } from "@/hooks/use-budget-store";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, parseISO, isValid, startOfDay } from "date-fns";
import { ru } from "date-fns/locale";
import type { CalendarNote } from "@/lib/types";

interface AddCalendarNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  noteToEdit?: CalendarNote | null;
  defaultDate?: Date;
}

export function AddCalendarNoteDialog({
  isOpen,
  onClose,
  noteToEdit,
  defaultDate,
}: AddCalendarNoteDialogProps) {
  const { addCalendarNote, updateCalendarNote } = useBudgetStore();
  const { toast } = useToast();

  const [noteContent, setNoteContent] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!noteToEdit;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && noteToEdit) {
        setNoteContent(noteToEdit.title || "");
        setDate(
          isValid(parseISO(noteToEdit.date))
            ? parseISO(noteToEdit.date)
            : new Date()
        );
      } else {
        setNoteContent("");
        setDate(defaultDate ? startOfDay(defaultDate) : new Date());
      }
      setIsSubmitting(false);
    }
  }, [isOpen, isEditMode, noteToEdit, defaultDate]);

  const handleSubmit = () => {
    if (!noteContent.trim() || !date) {
      toast({
        title: "Ошибка ввода",
        description: "Пожалуйста, введите текст заметки и выберите дату.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const noteData = {
      title: noteContent,
      type: "note" as const,
      year: date.getFullYear(),
      date: date.toISOString(),
    };

    if (isEditMode && noteToEdit) {
      updateCalendarNote(noteToEdit.id, noteData);
      toast({ title: "Заметка обновлена" });
    } else {
      addCalendarNote(noteData);
      toast({ title: "Заметка добавлена" });
    }

    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <NotebookPen className="mr-2 h-5 w-5 text-primary" />
            {isEditMode ? "Редактировать заметку" : "Новая заметка/напоминание"}
          </DialogTitle>
          <DialogDescription>
            Запишите что-нибудь важное для выбранной даты.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-1">
            <Label htmlFor="note-date">Дата *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="note-date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? (
                    format(date, "PPP", { locale: ru })
                  ) : (
                    <span>Выберите дату</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={ru}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1">
            <Label htmlFor="note-content">Текст заметки *</Label>
            <Textarea
              id="note-content"
              value={noteContent}
              onChange={e => setNoteContent(e.target.value)}
              placeholder="Например, позвонить в банк, записаться к врачу..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !noteContent.trim()}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isEditMode ? "Сохранить" : "Добавить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
