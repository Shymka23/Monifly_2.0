"use client";

import { useMemo, useCallback } from "react";
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
import {
  Calendar as CalendarIcon,
  PlusCircle,
  Edit3,
  Save,
} from "lucide-react";
import { useBudgetStore } from "@/hooks/use-budget-store";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { fr, ru, de, es, enUS, uk } from "date-fns/locale";
import { useTranslation } from "@/hooks/use-translation";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as yup from "yup";
import type {
  BudgetEntry,
  BudgetFrequency,
  TransactionType,
  NewBudgetEntryData,
} from "@/lib/types";
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_CATEGORY_LABELS,
} from "@/lib/types";

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
] as const;

interface AddBudgetEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entryToEdit?: BudgetEntry | null;
  defaultStartDate?: string;
  defaultFrequency?: BudgetFrequency;
}

interface FormValues {
  description: string;
  amount: string;
  currency: string;
  type: TransactionType;
  category: string;
  frequency: BudgetFrequency;
  startDate: Date;
  dayOfMonth?: number;
  limit?: string;
}

const createValidationSchema = (t: (key: string) => string) =>
  yup.object().shape({
    description: yup
      .string()
      .trim()
      .required(t("dialog.description_required"))
      .min(2, t("validation.description_min"))
      .max(100, t("validation.description_max")),
    amount: yup
      .string()
      .required(t("dialog.amount_required"))
      .matches(/^[0-9]*\.?[0-9]*$/, t("validation.amount_invalid"))
      .test("is-positive", t("validation.amount_positive"), value =>
        value ? parseFloat(value) > 0 : false
      )
      .test("max-decimals", t("validation.amount_decimals"), value =>
        value ? /^\d*\.?\d{0,2}$/.test(value) : true
      ),
    currency: yup
      .string()
      .required(t("dialog.currency_required"))
      .oneOf(AVAILABLE_CURRENCIES),
    type: yup
      .mixed<TransactionType>()
      .oneOf(["income", "expense"])
      .required(t("dialog.type_required")),
    category: yup.string().required(t("dialog.category_required")),
    frequency: yup
      .mixed<BudgetFrequency>()
      .oneOf(["monthly", "once"] as const)
      .required(t("dialog.frequency_required")),
    startDate: yup.date().required(t("dialog.start_date_required")),
    dayOfMonth: yup.number().when("frequency", {
      is: "monthly",
      then: schema =>
        schema
          .required(t("dialog.month_day_required"))
          .min(1, t("validation.day_range"))
          .max(31, t("validation.day_range")),
      otherwise: schema => schema.notRequired(),
    }),
    limit: yup
      .string()
      .optional()
      .matches(/^[0-9]*\.?[0-9]*$/, t("validation.limit_invalid"))
      .test("is-positive", t("validation.limit_positive"), value =>
        value ? parseFloat(value) >= 0 : true
      ),
  });

const BudgetFrequencySelect = ({
  value,
  onChange,
  disabled,
}: {
  value: BudgetFrequency;
  onChange: (value: BudgetFrequency) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation("budgeting");
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger aria-label={t("dialog.frequency_label")}>
        <SelectValue placeholder={t("dialog.frequency_placeholder")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="monthly">{t("periods.monthly")}</SelectItem>
        <SelectItem value="once">{t("periods.once")}</SelectItem>
      </SelectContent>
    </Select>
  );
};

export function AddBudgetEntryDialog({
  isOpen,
  onClose,
  entryToEdit,
  defaultStartDate,
  defaultFrequency,
}: AddBudgetEntryDialogProps) {
  const {
    addBudgetEntry,
    updateBudgetEntry,
    primaryDisplayCurrency,
    customTransactionCategories,
  } = useBudgetStore();
  const { toast } = useToast();
  const { t, i18n } = useTranslation("budgeting");
  const isEditMode = !!entryToEdit;

  const locales = {
    uk,
    fr,
    ru,
    de,
    es,
    en: enUS,
  };

  const allCategories = useMemo(() => {
    const defaultCats = TRANSACTION_CATEGORIES.map(c => ({
      value: c,
      label:
        TRANSACTION_CATEGORY_LABELS[
          c as keyof typeof TRANSACTION_CATEGORY_LABELS
        ] || c,
    }));
    const customCats = customTransactionCategories.map(c => ({
      value: c,
      label: c,
    }));
    return [...defaultCats, ...customCats]
      .filter(
        (item, index, self) =>
          index ===
          self.findIndex(
            t => t.value.toLowerCase() === item.value.toLowerCase()
          )
      )
      .sort((a, b) => a.label.localeCompare(b.label, "ru"));
  }, [customTransactionCategories]);

  const initialValues: FormValues = useMemo(
    () => ({
      description: entryToEdit?.description || "",
      amount: entryToEdit?.amount ? String(entryToEdit.amount) : "",
      currency: entryToEdit?.currency || primaryDisplayCurrency,
      type: entryToEdit?.type || "expense",
      category: entryToEdit?.category || allCategories[0]?.value || "",
      frequency: entryToEdit?.frequency || defaultFrequency || "monthly",
      startDate: entryToEdit?.startDate
        ? parseISO(entryToEdit.startDate)
        : defaultStartDate
        ? parseISO(defaultStartDate)
        : new Date(),
      dayOfMonth: entryToEdit?.dayOfMonth || new Date().getDate(),
      limit: entryToEdit?.limit ? String(entryToEdit.limit) : "",
    }),
    [
      entryToEdit,
      defaultStartDate,
      defaultFrequency,
      primaryDisplayCurrency,
      allCategories,
    ]
  );

  const handleSubmit = useCallback(
    async (
      values: FormValues,
      { setSubmitting, resetForm }: FormikHelpers<FormValues>
    ) => {
      try {
        const entryData: NewBudgetEntryData = {
          description: values.description.trim(),
          amount: parseFloat(String(values.amount)),
          currency: values.currency,
          type: values.type,
          category: values.category,
          frequency: values.frequency,
          startDate: values.startDate.toISOString(),
          dayOfMonth:
            values.frequency === "monthly" ? values.dayOfMonth : undefined,
          walletId: undefined,
          limit:
            values.type === "expense" &&
            values.frequency === "monthly" &&
            values.limit
              ? parseFloat(String(values.limit))
              : undefined,
          isActive: true,
        };

        if (isEditMode && entryToEdit) {
          updateBudgetEntry(entryToEdit.id, entryData);
          toast({ title: t("messages.budgetEntryUpdated") });
        } else {
          addBudgetEntry(entryData);
          toast({ title: t("messages.budgetEntryAdded") });
        }
        resetForm();
        onClose();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        toast({
          title: t("messages.error"),
          description: t("messages.saveError", { error: message }),
          variant: "destructive",
        });
      } finally {
        setSubmitting(false);
      }
    },
    [
      addBudgetEntry,
      updateBudgetEntry,
      entryToEdit,
      isEditMode,
      onClose,
      toast,
      t,
    ]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {isEditMode ? (
              <Edit3 className="mr-2 h-6 w-6 text-primary" aria-hidden="true" />
            ) : (
              <PlusCircle
                className="mr-2 h-6 w-6 text-primary"
                aria-hidden="true"
              />
            )}
            {isEditMode ? t("dialog.edit_title") : t("dialog.title")}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t("dialog.edit_description")
              : t("dialog.description")}
          </DialogDescription>
        </DialogHeader>
        <Formik<FormValues>
          initialValues={initialValues}
          validationSchema={createValidationSchema(t)}
          enableReinitialize
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, setFieldValue, values, errors, touched }) => (
            <Form className="space-y-4 py-4 pr-2">
              <div className="space-y-1">
                <Label htmlFor="description">
                  {t("dialog.description_label")} *
                </Label>
                <Field
                  name="description"
                  as={Input}
                  placeholder={t("dialog.description_placeholder")}
                  aria-invalid={touched.description && !!errors.description}
                  aria-describedby="description-error"
                />
                <ErrorMessage
                  name="description"
                  component="div"
                  className="text-sm text-destructive"
                  id="description-error"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="amount">{t("dialog.amount_label")} *</Label>
                  <Field
                    name="amount"
                    as={Input}
                    type="number"
                    step="0.01"
                    placeholder={t("dialog.amount_placeholder")}
                    aria-invalid={touched.amount && !!errors.amount}
                    aria-describedby="amount-error"
                  />
                  <ErrorMessage
                    name="amount"
                    component="div"
                    className="text-sm text-destructive"
                    id="amount-error"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="currency">
                    {t("dialog.currency_label")} *
                  </Label>
                  <Field name="currency">
                    {({ field }: { field: { value: string } }) => (
                      <Select
                        value={field.value}
                        onValueChange={value =>
                          setFieldValue("currency", value)
                        }
                        disabled={isSubmitting}
                        aria-invalid={touched.currency && !!errors.currency}
                        aria-describedby="currency-error"
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("dialog.currency_placeholder")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_CURRENCIES.map(currency => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </Field>
                  <ErrorMessage
                    name="currency"
                    component="div"
                    className="text-sm text-destructive"
                    id="currency-error"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="type">{t("dialog.type_label")} *</Label>
                <Field name="type">
                  {({ field }: { field: { value: TransactionType } }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={value => setFieldValue("type", value)}
                      className="mt-1 flex space-x-4"
                      disabled={isSubmitting}
                      aria-invalid={touched.type && !!errors.type}
                      aria-describedby="type-error"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="income" id="income" />
                        <Label htmlFor="income">
                          {t("dialog.type_income")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="expense" id="expense" />
                        <Label htmlFor="expense">
                          {t("dialog.type_expense")}
                        </Label>
                      </div>
                    </RadioGroup>
                  )}
                </Field>
                <ErrorMessage
                  name="type"
                  component="div"
                  className="text-sm text-destructive"
                  id="type-error"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="category">{t("dialog.category_label")} *</Label>
                <Field name="category">
                  {({ field }: { field: { value: string } }) => (
                    <Select
                      value={field.value}
                      onValueChange={value => setFieldValue("category", value)}
                      disabled={isSubmitting}
                      aria-invalid={touched.category && !!errors.category}
                      aria-describedby="category-error"
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("dialog.category_placeholder")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {allCategories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {t(`categories.${cat.value.toLowerCase()}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </Field>
                <ErrorMessage
                  name="category"
                  component="div"
                  className="text-sm text-destructive"
                  id="category-error"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="frequency">
                  {t("dialog.frequency_label")} *
                </Label>
                <Field name="frequency">
                  {({ field }: { field: { value: BudgetFrequency } }) => (
                    <BudgetFrequencySelect
                      value={field.value}
                      onChange={value => setFieldValue("frequency", value)}
                      disabled={isSubmitting}
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="frequency"
                  component="div"
                  className="text-sm text-destructive"
                  id="frequency-error"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="startDate">
                  {t("dialog.start_date_label")} *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !values.startDate && "text-muted-foreground"
                      )}
                      aria-invalid={touched.startDate && !!errors.startDate}
                      aria-describedby="startDate-error"
                    >
                      <CalendarIcon
                        className="mr-2 h-4 w-4"
                        aria-hidden="true"
                      />
                      {values.startDate ? (
                        format(values.startDate, "PPP", {
                          locale:
                            locales[
                              i18n.language.split(
                                "-"
                              )[0] as keyof typeof locales
                            ] || enUS,
                        })
                      ) : (
                        <span>{t("dialog.start_date_placeholder")}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={values.startDate}
                      onSelect={date =>
                        date && setFieldValue("startDate", date)
                      }
                      initialFocus
                      locale={
                        locales[
                          i18n.language.split("-")[0] as keyof typeof locales
                        ] || enUS
                      }
                      disabled={isSubmitting}
                    />
                  </PopoverContent>
                </Popover>
                <ErrorMessage
                  name="startDate"
                  component="div"
                  className="text-sm text-destructive"
                  id="startDate-error"
                />
              </div>

              {values.frequency === "monthly" && (
                <div className="space-y-1">
                  <Label htmlFor="dayOfMonth">
                    {t("dialog.month_day_label")} *
                  </Label>
                  <Field
                    name="dayOfMonth"
                    as={Input}
                    type="number"
                    min={1}
                    max={31}
                    placeholder="1-31"
                    aria-invalid={touched.dayOfMonth && !!errors.dayOfMonth}
                    aria-describedby="dayOfMonth-error"
                  />
                  <ErrorMessage
                    name="dayOfMonth"
                    component="div"
                    className="text-sm text-destructive"
                    id="dayOfMonth-error"
                  />
                </div>
              )}

              {values.type === "expense" && values.frequency === "monthly" && (
                <div className="space-y-1">
                  <Label htmlFor="limit">{t("dialog.limit_label")}</Label>
                  <Field
                    name="limit"
                    as={Input}
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder={t("dialog.limit_placeholder")}
                    aria-invalid={touched.limit && !!errors.limit}
                    aria-describedby="limit-error"
                  />
                  <ErrorMessage
                    name="limit"
                    component="div"
                    className="text-sm text-destructive"
                    id="limit-error"
                  />
                </div>
              )}

              <DialogFooter className="mt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? (
                    <span>{t("dialog.saving")}</span>
                  ) : (
                    <>
                      {isEditMode ? (
                        <Save className="mr-2 h-5 w-5" aria-hidden="true" />
                      ) : (
                        <PlusCircle
                          className="mr-2 h-5 w-5"
                          aria-hidden="true"
                        />
                      )}
                      {isEditMode ? t("dialog.update") : t("dialog.submit")}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
