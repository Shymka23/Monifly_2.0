"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useLifePlanningStore from "@/hooks/use-life-planning-store";
import { Upload, X, ImageIcon } from "lucide-react";
import type { PersonalMilestone, FinancialGoal } from "@/lib/types";
import { MILESTONE_CATEGORIES } from "@/lib/types";

interface AddDetailedGoalDialogProps {
  year: number;
  month: number;
  day: number;
  isOpen: boolean;
  onClose: () => void;
}

type GoalType = "personal" | "financial";

export function AddDetailedGoalDialog({
  year,
  month,
  day,
  isOpen,
  onClose,
}: AddDetailedGoalDialogProps) {
  const { addPersonalMilestone, addFinancialGoal } = useLifePlanningStore();

  const [goalType, setGoalType] = useState<GoalType>("personal");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("other");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("UAH");
  const [financialType, setFinancialType] = useState<
    "income" | "expense" | "investment" | "saving"
  >("saving");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    if (goalType === "personal") {
      const milestone: PersonalMilestone = {
        id: `milestone-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        category: category as PersonalMilestone["category"],
        isCompleted: false,
        reminders: [],
        imageUrl: imageUrl || undefined,
        month,
        day,
        targetDate: new Date(year, month, day).toISOString(),
      };
      addPersonalMilestone(year, milestone);
    } else {
      const goal: FinancialGoal = {
        id: `goal-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        type: financialType,
        amount: parseFloat(amount) || 0,
        currency,
        isRecurring: false,
        imageUrl: imageUrl || undefined,
        status: "in_progress",
        targetDate: new Date(year, month, day).toISOString(),
      };
      addFinancialGoal(year, goal);
    }

    handleClose();
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setCategory("other");
    setAmount("");
    setImagePreview(null);
    setImageUrl("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Додати ціль на {day} день, {month + 1} місяць {year} року
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Тип цілі */}
          <div className="space-y-2">
            <Label>Тип цілі</Label>
            <Select
              value={goalType}
              onValueChange={value => setGoalType(value as GoalType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Особиста віха</SelectItem>
                <SelectItem value="financial">Фінансова ціль</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Назва */}
          <div className="space-y-2">
            <Label htmlFor="title">Назва *</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Назва вашої цілі"
            />
          </div>

          {/* Опис */}
          <div className="space-y-2">
            <Label htmlFor="description">Опис</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Детальний опис цілі"
              rows={3}
            />
          </div>

          {/* Зображення */}
          <div className="space-y-2">
            <Label>Зображення цілі</Label>
            <div className="space-y-3">
              {imagePreview ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Натисніть щоб завантажити зображення
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG до 5MB
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
              {!imagePreview && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Завантажити зображення
                </Button>
              )}
            </div>
          </div>

          {/* Поля для особистої віхи */}
          {goalType === "personal" && (
            <div className="space-y-2">
              <Label htmlFor="category">Категорія</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MILESTONE_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat === "career"
                        ? "Кар'єра"
                        : cat === "family"
                        ? "Сім'я"
                        : cat === "health"
                        ? "Здоров'я"
                        : cat === "education"
                        ? "Освіта"
                        : cat === "travel"
                        ? "Подорожі"
                        : "Інше"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Поля для фінансової цілі */}
          {goalType === "financial" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="financialType">Тип фінансової цілі</Label>
                <Select
                  value={financialType}
                  onValueChange={value =>
                    setFinancialType(
                      value as "income" | "expense" | "investment" | "saving"
                    )
                  }
                >
                  <SelectTrigger id="financialType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Дохід</SelectItem>
                    <SelectItem value="expense">Витрата</SelectItem>
                    <SelectItem value="investment">Інвестиція</SelectItem>
                    <SelectItem value="saving">Заощадження</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Сума</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Валюта</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UAH">UAH</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Скасувати
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            Додати ціль
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
