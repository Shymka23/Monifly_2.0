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
import { PlusCircle, Save, PackageOpen, Edit3 } from "lucide-react";
import { useBudgetStore } from "@/hooks/use-budget-store";
import { useToast } from "@/hooks/use-toast";
import type {
  InvestmentAsset,
  InvestmentAssetType,
  NewInvestmentAssetData,
  InvestmentAssetRegion,
} from "@/lib/types";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import {
  INVESTMENT_ASSET_TYPE_LABELS,
  INVESTMENT_ASSET_TYPES,
  INVESTMENT_ASSET_REGIONS,
  INVESTMENT_ASSET_REGION_LABELS,
} from "@/lib/types";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as yup from "yup";
import type { FieldProps, FormikProps } from "formik";

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
]; // Should match global list

interface AddEditInvestmentAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  assetToEdit?: InvestmentAsset | null;
}

interface AddEditInvestmentAssetFormValues {
  name: string;
  type: InvestmentAssetType | "";
  region?: InvestmentAssetRegion;
  quantity: string;
  purchasePrice: string;
  currency: string;
  currentPrice: string;
}

const assetSchema = yup.object({
  name: yup.string().required("Вкажіть назву активу"),
  type: yup
    .mixed<InvestmentAssetType>()
    .oneOf(INVESTMENT_ASSET_TYPES)
    .required("Оберіть тип активу"),
  region: yup.mixed().optional(),
  quantity: yup
    .string()
    .required("Введіть кількість")
    .test(
      "is-positive",
      "Кількість має бути більше 0",
      (v: string) => parseFloat(v) > 0
    ),
  purchasePrice: yup
    .string()
    .required("Введіть ціну покупки")
    .test(
      "is-non-negative",
      "Ціна не може бути від'ємною",
      (v: string) => parseFloat(v) >= 0
    ),
  currency: yup.string().required("Оберіть валюту"),
  currentPrice: yup
    .string()
    .required("Введіть поточну ціну")
    .test(
      "is-non-negative",
      "Ціна не може бути від'ємною",
      (v: string) => parseFloat(v) >= 0
    ),
});

export function AddEditInvestmentAssetDialog({
  isOpen,
  onClose,
  caseId,
  assetToEdit,
}: AddEditInvestmentAssetDialogProps) {
  const { addAssetToCase, updateAssetInCase, primaryDisplayCurrency } =
    useBudgetStore(state => ({
      addAssetToCase: state.addAssetToCase,
      updateAssetInCase: state.updateAssetInCase,
      primaryDisplayCurrency: state.primaryDisplayCurrency,
    }));
  const { toast } = useToast();
  const isEditMode = !!assetToEdit;

  const initialValues: AddEditInvestmentAssetFormValues = {
    name: assetToEdit?.name || "",
    type: assetToEdit?.type || "",
    region: assetToEdit?.region || undefined,
    quantity: assetToEdit?.quantity ? String(assetToEdit.quantity) : "",
    purchasePrice: assetToEdit?.purchasePrice
      ? String(assetToEdit.purchasePrice)
      : "",
    currency: assetToEdit?.currency || primaryDisplayCurrency,
    currentPrice: assetToEdit?.currentPrice
      ? String(assetToEdit.currentPrice)
      : "",
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {isEditMode ? (
              <Edit3 className="mr-2 h-6 w-6 text-primary" />
            ) : (
              <PackageOpen className="mr-2 h-6 w-6 text-primary" />
            )}
            {isEditMode ? "Редагувати актив" : "Додати новий актив"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Оновіть деталі вашого інвестиційного активу."
              : "Укажіть деталі нового активу для вашого інвестиційного кейсу."}
          </DialogDescription>
        </DialogHeader>
        <Formik
          initialValues={initialValues}
          validationSchema={assetSchema}
          enableReinitialize
          onSubmit={async (
            values,
            {
              setSubmitting,
              resetForm,
            }: FormikHelpers<AddEditInvestmentAssetFormValues>
          ) => {
            setSubmitting(true);
            const assetData: NewInvestmentAssetData = {
              name: values.name,
              type: values.type as InvestmentAssetType,
              region: values.region || undefined,
              quantity: parseFloat(values.quantity),
              purchasePrice: parseFloat(values.purchasePrice),
              currency: values.currency,
              purchaseDate: new Date().toISOString(),
            };
            if (isEditMode && assetToEdit) {
              updateAssetInCase(caseId, assetToEdit.id, assetData);
              toast({
                title: "Актив оновлено",
                description: `Актив "${values.name}" успішно оновлено.`,
              });
            } else {
              addAssetToCase(caseId, assetData);
              toast({
                title: "Актив додано",
                description: `Актив "${values.name}" успішно додано в кейс.`,
              });
            }
            setSubmitting(false);
            resetForm();
            onClose();
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="space-y-3 py-3 max-h-[60vh] overflow-y-auto pr-2">
                <div className="space-y-1">
                  <Label htmlFor="assetName">Назва активу *</Label>
                  <Field
                    name="name"
                    as={Input}
                    placeholder="Наприклад, Акції Apple (AAPL)"
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-sm text-destructive"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="assetType">Тип активу *</Label>
                    <Field name="type">
                      {({
                        field,
                        form,
                      }: {
                        field: FieldProps["field"];
                        form: FormikProps<AddEditInvestmentAssetFormValues>;
                      }) => (
                        <Select
                          value={field.value || ""}
                          onValueChange={value =>
                            form.setFieldValue(field.name, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Оберіть тип активу" />
                          </SelectTrigger>
                          <SelectContent>
                            {INVESTMENT_ASSET_TYPES.map(typeKey => (
                              <SelectItem key={typeKey} value={typeKey}>
                                {INVESTMENT_ASSET_TYPE_LABELS[typeKey]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </Field>
                    <ErrorMessage
                      name="type"
                      component="div"
                      className="text-sm text-destructive"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="assetRegion">Регіон (необов'язково)</Label>
                    <Field name="region">
                      {({
                        field,
                        form,
                      }: {
                        field: FieldProps["field"];
                        form: FormikProps<AddEditInvestmentAssetFormValues>;
                      }) => (
                        <Select
                          value={field.value || ""}
                          onValueChange={value =>
                            form.setFieldValue(field.name, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Оберіть регіон" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Не вказано</SelectItem>
                            {INVESTMENT_ASSET_REGIONS.map(regionKey => (
                              <SelectItem key={regionKey} value={regionKey}>
                                {INVESTMENT_ASSET_REGION_LABELS[regionKey]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </Field>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="quantity">Кількість *</Label>
                    <Field
                      name="quantity"
                      as={Input}
                      type="number"
                      placeholder="Наприклад, 10"
                    />
                    <ErrorMessage
                      name="quantity"
                      component="div"
                      className="text-sm text-destructive"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="purchasePrice">Ціна покупки *</Label>
                    <Field
                      name="purchasePrice"
                      as={Input}
                      type="number"
                      placeholder="Наприклад, 150"
                    />
                    <ErrorMessage
                      name="purchasePrice"
                      component="div"
                      className="text-sm text-destructive"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="currency">Валюта *</Label>
                    <Field name="currency">
                      {({
                        field,
                        form,
                      }: {
                        field: FieldProps["field"];
                        form: FormikProps<AddEditInvestmentAssetFormValues>;
                      }) => (
                        <Select
                          value={field.value || ""}
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
                  <div className="space-y-1">
                    <Label htmlFor="currentPrice">Поточна ціна *</Label>
                    <Field
                      name="currentPrice"
                      as={Input}
                      type="number"
                      placeholder="Наприклад, 170"
                    />
                    <ErrorMessage
                      name="currentPrice"
                      component="div"
                      className="text-sm text-destructive"
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button type="submit" disabled={isSubmitting}>
                    {isEditMode ? (
                      <Save className="mr-2 h-5 w-5" />
                    ) : (
                      <PlusCircle className="mr-2 h-5 w-5" />
                    )}
                    {isEditMode ? "Оновити актив" : "Додати актив"}
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
