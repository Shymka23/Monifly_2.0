"use client";

import { useState, useEffect, useRef } from "react"; // Added useRef
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2, Save, CalendarDays, X } from "lucide-react";
import { useBudgetStore } from "@/hooks/use-budget-store";
import { useToast } from "@/hooks/use-toast";
import { createSmartFinancialGoal } from "@/ai/flows/smart-goal-creator";
import type {
  FinancialGoal,
  SmartGoalCreatorInput,
  SmartGoalCreatorOutput,
} from "@/lib/types";
import Image from "next/image";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { Target } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, parseISO, isValid } from "date-fns";
import { ru } from "date-fns/locale";
import { Formik, Form, Field, ErrorMessage } from "formik";
import type { FormikHelpers } from "formik";
import type { FieldProps, FormikProps } from "formik";
import * as yup from "yup";

const AVAILABLE_CURRENCIES = [
  "RUB",
  "USD",
  "EUR",
  "UAH",
  "GBP",
  "JPY",
  "CAD",
  "AUD",
  "CHF",
  "CNY",
  "INR",
  "PLN",
  "TRY",
  "KZT",
  "BYN",
];

interface AddFinancialGoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: FinancialGoal | null;
  defaultProjectedCompletionDate?: string; // ISO string
}

interface GoalFormValues {
  goalName: string;
  targetAmount: string;
  targetCurrency: string;
  monthlyContribution: string;
  description?: string;
  imageUrl?: string;
}

const goalSchema = yup.object({
  goalName: yup.string().required("Введіть назву цілі"),
  targetAmount: yup
    .number()
    .typeError("Введіть суму")
    .positive("Сума має бути більше 0")
    .required("Введіть суму"),
  targetCurrency: yup.string().required("Оберіть валюту"),
  monthlyContribution: yup
    .number()
    .typeError("Введіть щомісячний внесок")
    .positive("Внесок має бути більше 0")
    .required("Введіть щомісячний внесок"),
  description: yup.string(),
});

export function AddFinancialGoalDialog({
  isOpen,
  onClose,
  goalToEdit,
  defaultProjectedCompletionDate,
}: AddFinancialGoalDialogProps) {
  const { addFinancialGoal, updateFinancialGoal, primaryDisplayCurrency } =
    useBudgetStore(state => ({
      addFinancialGoal: state.addFinancialGoal,
      updateFinancialGoal: state.updateFinancialGoal,
      primaryDisplayCurrency: state.primaryDisplayCurrency,
    }));
  const { toast } = useToast();
  const [userInput, setUserInput] = useState("");
  const [aiGeneratedImageUrl, setAiGeneratedImageUrl] = useState<
    string | undefined
  >(undefined);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<
    string | undefined
  >(undefined);
  const [projectedDate, setProjectedDate] = useState<Date | undefined>(
    undefined
  );
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = !!goalToEdit;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && goalToEdit) {
        setUserInput(goalToEdit.description || "");
        setAiGeneratedImageUrl(undefined);
        setUploadedImagePreview(goalToEdit.imageUrl);
        setProjectedDate(
          goalToEdit.projectedCompletionDate
            ? parseISO(goalToEdit.projectedCompletionDate)
            : undefined
        );
        setShowManualForm(true);
      } else {
        setUserInput("");
        setAiGeneratedImageUrl(undefined);
        setUploadedImagePreview(undefined);
        const initialDate =
          defaultProjectedCompletionDate &&
          isValid(parseISO(defaultProjectedCompletionDate))
            ? parseISO(defaultProjectedCompletionDate)
            : undefined;
        setProjectedDate(initialDate);
        setIsAiLoading(false);
        setShowManualForm(!!defaultProjectedCompletionDate || isEditMode);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input
      }
    }
  }, [
    isOpen,
    isEditMode,
    goalToEdit,
    primaryDisplayCurrency,
    defaultProjectedCompletionDate,
  ]);

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: FormikHelpers<GoalFormValues>["setFieldValue"]
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImagePreview(reader.result as string);
        setAiGeneratedImageUrl(undefined);
        setFieldValue("imageUrl", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearUploadedImage = (
    setFieldValue: FormikHelpers<GoalFormValues>["setFieldValue"]
  ) => {
    setUploadedImagePreview(undefined);
    setFieldValue("imageUrl", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSmartCreate = async (
    setFieldValue: FormikHelpers<GoalFormValues>["setFieldValue"]
  ) => {
    if (!userInput.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, опишите вашу цель.",
        variant: "destructive",
      });
      return;
    }
    setIsAiLoading(true);
    setAiGeneratedImageUrl(undefined);
    setUploadedImagePreview(undefined);
    try {
      const aiInput: SmartGoalCreatorInput = {
        userInput,
        currentIncome: 50000,
        currentExpenses: 30000,
        age: 30,
        desiredGoals: ["savings", "investment"],
        riskTolerance: "medium",
        timeHorizon: 5,
        currency: primaryDisplayCurrency,
      };
      const aiOutput: SmartGoalCreatorOutput = await createSmartFinancialGoal(
        aiInput
      );
      setFieldValue("goalName", aiOutput.goals?.[0]?.name || "Новая цель");
      setFieldValue(
        "targetAmount",
        aiOutput.targetAmount > 0 ? String(aiOutput.targetAmount) : ""
      );
      setFieldValue("targetCurrency", primaryDisplayCurrency);
      setFieldValue("description", userInput);
      // Note: generatedImageUrl is not available in SmartGoalCreatorOutput
      // This would need to be handled separately if image generation is needed
      setShowManualForm(true);
      toast({
        title: "Цель распознана!",
        description:
          "Пожалуйста, проверьте детали и укажите ежемесячный взнос и дату.",
      });
    } catch {
      toast({
        title: "Ошибка",
        description:
          "Не удалось создать цель с помощью ИИ. Попробуйте создать цель вручную.",
        variant: "destructive",
      });
      setShowManualForm(true);
    } finally {
      setIsAiLoading(false);
    }
  };

  const currentImageToDisplay = uploadedImagePreview || aiGeneratedImageUrl;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Target className="mr-2 h-6 w-6 text-primary" />
            {isEditMode
              ? "Редактировать финансовую цель"
              : "Новая финансовая цель"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Обновите детали вашей финансовой цели."
              : "Опишите вашу цель, и ИИ поможет ее сформулировать, или введите данные вручную."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 pr-2">
          {!isEditMode && !defaultProjectedCompletionDate && (
            <div>
              <Label htmlFor="userInput" className="text-base font-medium">
                Опишите вашу цель (для ИИ)
              </Label>
              <Textarea
                id="userInput"
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                placeholder="Например: накопить на машину Cupra Formentor за 40000 долларов, или создать резервный фонд 300 000 рублей, или на отпуск на Мальдивах, или на ремонт квартиры"
                rows={3}
                className="mt-1"
                disabled={isAiLoading || showManualForm}
              />
              <Formik initialValues={{}} onSubmit={() => {}}>
                {({ setFieldValue }) => (
                  <Button
                    onClick={() => handleSmartCreate(setFieldValue)}
                    disabled={
                      isAiLoading || !userInput.trim() || showManualForm
                    }
                    className="mt-2 w-full sm:w-auto"
                  >
                    {isAiLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Распознать с ИИ
                  </Button>
                )}
              </Formik>
              {!showManualForm && (
                <p className="text-xs text-muted-foreground mt-1">
                  Или{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-xs"
                    onClick={() => setShowManualForm(true)}
                  >
                    введите данные вручную
                  </Button>
                  .
                </p>
              )}
            </div>
          )}

          {showManualForm && (
            <Formik
              initialValues={{
                goalName: goalToEdit?.name || "",
                targetAmount: goalToEdit?.targetAmount
                  ? String(goalToEdit?.targetAmount)
                  : "",
                targetCurrency:
                  goalToEdit?.targetCurrency || primaryDisplayCurrency,
                monthlyContribution: goalToEdit?.monthlyContribution
                  ? String(goalToEdit?.monthlyContribution)
                  : "",
                description: goalToEdit?.description || "",
                imageUrl: uploadedImagePreview || aiGeneratedImageUrl,
              }}
              validationSchema={goalSchema}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                const goalDataPayload = {
                  title: values.goalName,
                  type: "saving" as const,
                  amount: parseFloat(values.targetAmount),
                  currency: values.targetCurrency,
                  isRecurring: true,
                  monthlyContribution: parseFloat(values.monthlyContribution),
                  description: values.description || userInput,
                  imageUrl: values.imageUrl,
                  projectedCompletionDate: projectedDate
                    ? projectedDate.toISOString()
                    : undefined,
                };
                if (isEditMode && goalToEdit) {
                  updateFinancialGoal(goalToEdit.id, goalDataPayload);
                  toast({
                    title: "Цель обновлена!",
                    description: `Финансовая цель "${values.goalName}" успешно обновлена.`,
                  });
                } else {
                  addFinancialGoal(goalDataPayload);
                  toast({
                    title: "Цель добавлена!",
                    description: `Финансовая цель "${values.goalName}" успешно создана.`,
                  });
                }
                setSubmitting(false);
                resetForm();
                onClose();
              }}
              enableReinitialize
            >
              {({ setFieldValue }) => (
                <Form>
                  <div className="space-y-1">
                    <Label htmlFor="goalImageUpload">
                      Изображение цели (необязательно)
                    </Label>
                    <div className="flex items-center gap-2">
                      <input
                        id="goalImageUpload"
                        type="file"
                        accept="image/*"
                        onChange={e => handleImageUpload(e, setFieldValue)}
                        className="text-xs flex-grow"
                        ref={fileInputRef}
                      />
                      {currentImageToDisplay && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => clearUploadedImage(setFieldValue)}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {currentImageToDisplay && (
                      <div className="mt-2 relative w-32 h-24 border rounded-md overflow-hidden">
                        <Image
                          src={currentImageToDisplay}
                          alt="Предпросмотр цели"
                          layout="fill"
                          objectFit="cover"
                          data-ai-hint="goal preview image"
                        />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Загрузите свое изображение или оставьте пустым для
                      возможной генерации ИИ.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-1">
                      <Label htmlFor="goalName">Назва цілі *</Label>
                      <Field name="goalName" as={Input} />
                      <ErrorMessage
                        name="goalName"
                        component="div"
                        className="text-sm text-destructive"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="targetAmount">Сума *</Label>
                      <Field name="targetAmount" as={Input} type="number" />
                      <ErrorMessage
                        name="targetAmount"
                        component="div"
                        className="text-sm text-destructive"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="targetCurrency">Валюта *</Label>
                      <Field name="targetCurrency">
                        {({
                          field,
                          form,
                        }: {
                          field: FieldProps["field"];
                          form: FormikProps<GoalFormValues>;
                        }) => (
                          <Select
                            value={field.value}
                            onValueChange={value =>
                              form.setFieldValue(field.name, value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Оберіть валюту" />
                            </SelectTrigger>
                            <SelectContent>
                              {AVAILABLE_CURRENCIES.map(c => (
                                <SelectItem key={c} value={c}>
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </Field>
                      <ErrorMessage
                        name="targetCurrency"
                        component="div"
                        className="text-sm text-destructive"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="monthlyContribution">
                        Щомісячний внесок *
                      </Label>
                      <Field
                        name="monthlyContribution"
                        as={Input}
                        type="number"
                      />
                      <ErrorMessage
                        name="monthlyContribution"
                        component="div"
                        className="text-sm text-destructive"
                      />
                    </div>
                  </div>
                  <div className="space-y-1 mt-4">
                    <Label htmlFor="projectedDate">
                      Планова дата досягнення (необов'язково)
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !projectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {projectedDate ? (
                            format(projectedDate, "PPP", { locale: ru })
                          ) : (
                            <span>Выберите дату</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={projectedDate}
                          onSelect={setProjectedDate}
                          initialFocus
                          locale={ru}
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-muted-foreground">
                      Якщо не вказано, буде розраховано на основі внесків.
                      Інакше, буде використано вказану дату.
                    </p>
                  </div>
                  <div className="space-y-1 mt-4">
                    <Label htmlFor="description">Опис (необов'язково)</Label>
                    <Field name="description" as={Textarea} />
                  </div>
                  <DialogFooter className="mt-6">
                    <Button type="submit">
                      <Save className="mr-2 h-5 w-5" />
                      {isEditMode ? "Оновити ціль" : "Додати ціль"}
                    </Button>
                  </DialogFooter>
                </Form>
              )}
            </Formik>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
