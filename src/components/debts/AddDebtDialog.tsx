"use client";

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
import { Calendar as CalendarIcon, PlusCircle, Landmark } from "lucide-react";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import type { DebtType, NewDebtData } from "@/lib/types";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import type { FormikHelpers, FieldProps, FormikProps } from "formik";

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

interface AddDebtDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DebtFormValues {
  type: DebtType;
  personName: string;
  description: string;
  amount: string;
  currency: string;
  dueDate?: Date;
  initialWalletId: string;
}

const debtSchema = yup.object({
  type: yup.string().oneOf(["iOwe", "owedToMe"]).required(),
  personName: yup.string().required("Вкажіть ім'я або організацію"),
  description: yup.string().required("Вкажіть опис боргу"),
  amount: yup
    .number()
    .typeError("Введіть суму")
    .positive("Сума має бути більше 0")
    .required("Введіть суму"),
  currency: yup.string().required("Оберіть валюту"),
  dueDate: yup.date().nullable(),
  initialWalletId: yup.string().required("Оберіть гаманець"),
});

export function AddDebtDialog({ isOpen, onClose }: AddDebtDialogProps) {
  const { addDebt, primaryDisplayCurrency, wallets } = useBudgetStore(
    state => ({
      addDebt: state.addDebt,
      primaryDisplayCurrency: state.primaryDisplayCurrency,
      wallets: state.wallets,
    })
  );
  const { toast } = useToast();

  const initialValues: DebtFormValues = {
    type: "iOwe",
    personName: "",
    description: "",
    amount: "",
    currency: primaryDisplayCurrency,
    dueDate: undefined,
    initialWalletId: wallets.length > 0 ? wallets[0].id : "",
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Landmark className="mr-2 h-6 w-6 text-primary" />
            Добавить новый долг
          </DialogTitle>
          <DialogDescription>
            Укажите детали вашего финансового обязательства.
          </DialogDescription>
        </DialogHeader>
        <Formik
          initialValues={initialValues}
          validationSchema={debtSchema}
          onSubmit={async (
            values,
            { setSubmitting, resetForm }: FormikHelpers<DebtFormValues>
          ) => {
            setSubmitting(true);
            const debtData: NewDebtData = {
              type: values.type,
              personName: values.personName,
              description: values.description,
              amount: parseFloat(values.amount),
              currency: values.currency,
              dueDate: values.dueDate
                ? new Date(values.dueDate).toISOString()
                : new Date().toISOString(),
              initialWalletId: values.initialWalletId,
              title: values.description,
              startDate: new Date().toISOString(),
              interestRate: 0,
              isActive: true,
            };
            const success = addDebt(debtData);
            if (success) {
              toast({
                title: "Долг добавлен",
                description: `Запись о долге успешно создана.`,
              });
              resetForm();
              onClose();
            } else {
              setSubmitting(false);
            }
          }}
          enableReinitialize
        >
          {({ setFieldValue, values }) => (
            <Form>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="type" className="text-base font-medium">
                    Тип долга *
                  </Label>
                  <Field name="type">
                    {({ field }: { field: { value: DebtType } }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={val => setFieldValue("type", val)}
                        className="mt-1 flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="iOwe" id="iOwe" />
                          <Label htmlFor="iOwe">Я должен</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="owedToMe" id="owedToMe" />
                          <Label htmlFor="owedToMe">Мне должны</Label>
                        </div>
                      </RadioGroup>
                    )}
                  </Field>
                  <ErrorMessage
                    name="type"
                    component="div"
                    className="text-sm text-destructive"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="personName">
                    {values.type === "iOwe"
                      ? "Кому я должен (Кредитор) *"
                      : "Кто мне должен (Должник) *"}
                  </Label>
                  <Field name="personName" as={Input} />
                  <ErrorMessage
                    name="personName"
                    component="div"
                    className="text-sm text-destructive"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="description">Описание (за что) *</Label>
                  <Field name="description" as={Textarea} rows={2} />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="text-sm text-destructive"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="amount">Сумма *</Label>
                    <Field name="amount" as={Input} type="number" />
                    <ErrorMessage
                      name="amount"
                      component="div"
                      className="text-sm text-destructive"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="currency">Валюта *</Label>
                    <Field name="currency">
                      {({
                        field,
                        form,
                      }: {
                        field: FieldProps["field"];
                        form: FormikProps<DebtFormValues>;
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
                      name="currency"
                      component="div"
                      className="text-sm text-destructive"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dueDate">Срок возврата (необязательно)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !values.dueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {values.dueDate ? (
                          format(new Date(values.dueDate), "PPP", {
                            locale: ru,
                          })
                        ) : (
                          <span>Выберите дату</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          values.dueDate ? new Date(values.dueDate) : undefined
                        }
                        onSelect={date => setFieldValue("dueDate", date)}
                        initialFocus
                        locale={ru}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="initialWalletId">
                    {values.type === "iOwe"
                      ? "Зачислить на кошелек (куда поступили средства) *"
                      : "Списать с кошелька (откуда выданы средства) *"}
                  </Label>
                  <Field name="initialWalletId">
                    {({
                      field,
                      form,
                    }: {
                      field: FieldProps["field"];
                      form: FormikProps<DebtFormValues>;
                    }) => (
                      <Select
                        value={field.value}
                        onValueChange={value =>
                          form.setFieldValue(field.name, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Оберіть гаманець" />
                        </SelectTrigger>
                        <SelectContent>
                          {wallets.map(w => (
                            <SelectItem key={w.id} value={w.id}>
                              {w.name} ({w.currency})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </Field>
                  <ErrorMessage
                    name="initialWalletId"
                    component="div"
                    className="text-sm text-destructive"
                  />
                </div>
                <DialogFooter className="mt-6">
                  <Button type="submit">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Добавить долг
                  </Button>
                </DialogFooter>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
