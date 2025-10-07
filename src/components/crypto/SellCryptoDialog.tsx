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
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { useBudgetStore } from "@/hooks/use-budget-store";
import type { Wallet, CryptoHolding } from "@/lib/types";
import { Send, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as yup from "yup";
import type { FieldProps, FormikProps } from "formik";

const AVAILABLE_FIAT_CURRENCIES = [
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

interface SellCryptoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  holdingToSell: CryptoHolding | null;
  fiatWallets: Wallet[];
}

interface SellCryptoFormValues {
  selectedFiatWalletId: string;
  amountToSell: string;
  pricePerUnit: string;
  saleCurrency: string;
}

const sellCryptoSchema: yup.Schema<SellCryptoFormValues> = yup.object({
  selectedFiatWalletId: yup.string().required("Оберіть фіатний гаманець"),
  amountToSell: yup
    .string()
    .required("Введіть кількість")
    .test(
      "is-positive",
      "Кількість має бути більше 0",
      (v: string) => parseFloat(v) > 0
    ),
  pricePerUnit: yup
    .string()
    .required("Введіть ціну")
    .test(
      "is-positive",
      "Ціна має бути більше 0",
      (v: string) => parseFloat(v) > 0
    ),
  saleCurrency: yup.string().required("Оберіть валюту продажу"),
});

export function SellCryptoDialog({
  isOpen,
  onClose,
  holdingToSell,
  fiatWallets,
}: SellCryptoDialogProps) {
  const { sellCrypto, primaryDisplayCurrency } = useBudgetStore();

  if (!holdingToSell) return null;

  const initialValues: SellCryptoFormValues = {
    selectedFiatWalletId: fiatWallets.length > 0 ? fiatWallets[0].id : "",
    amountToSell: holdingToSell.amount ? String(holdingToSell.amount) : "",
    pricePerUnit: "",
    saleCurrency: primaryDisplayCurrency || "",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Send className="mr-2 h-5 w-5 text-primary" />
            Продать {holdingToSell.name} ({holdingToSell.asset})
          </DialogTitle>
          <DialogDescription>
            Доступно для продажи:{" "}
            {holdingToSell.amount.toLocaleString(undefined, {
              maximumFractionDigits: 8,
            })}{" "}
            {holdingToSell.asset}. Средства будут зачислены на выбранный фиатный
            кошелек.
          </DialogDescription>
        </DialogHeader>
        <Formik
          initialValues={initialValues}
          validationSchema={sellCryptoSchema}
          enableReinitialize
          onSubmit={async (
            values,
            { setSubmitting, resetForm }: FormikHelpers<SellCryptoFormValues>
          ) => {
            setSubmitting(true);
            const success = sellCrypto(
              values.selectedFiatWalletId,
              holdingToSell.id,
              parseFloat(values.amountToSell),
              parseFloat(values.pricePerUnit),
              values.saleCurrency
            );
            setSubmitting(false);
            if (success) {
              resetForm();
              onClose();
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="space-y-4 py-3">
                <div>
                  <Label htmlFor="fiatWalletSell">Зачислить на кошелек *</Label>
                  <Field name="selectedFiatWalletId">
                    {({
                      field,
                      form,
                    }: {
                      field: FieldProps["field"];
                      form: FormikProps<SellCryptoFormValues>;
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
                          {fiatWallets.map(w => (
                            <SelectItem key={w.id} value={w.id}>
                              {w.name} ({formatCurrency(w.balance, w.currency)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </Field>
                  <ErrorMessage
                    name="selectedFiatWalletId"
                    component="div"
                    className="text-sm text-destructive"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amountToSell">Количество крипто *</Label>
                    <Field
                      name="amountToSell"
                      as={Input}
                      type="number"
                      placeholder={`Макс: ${holdingToSell.amount}`}
                      max={holdingToSell.amount.toString()}
                    />
                    <ErrorMessage
                      name="amountToSell"
                      component="div"
                      className="text-sm text-destructive"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pricePerUnitSell">Цена за единицу *</Label>
                    <Field
                      name="pricePerUnit"
                      as={Input}
                      type="number"
                      placeholder="Например, 65000"
                    />
                    <ErrorMessage
                      name="pricePerUnit"
                      component="div"
                      className="text-sm text-destructive"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="saleCurrency">Валюта продажи *</Label>
                  <Field name="saleCurrency">
                    {({
                      field,
                      form,
                    }: {
                      field: FieldProps["field"];
                      form: FormikProps<SellCryptoFormValues>;
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
                          {AVAILABLE_FIAT_CURRENCIES.map(c => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </Field>
                  <ErrorMessage
                    name="saleCurrency"
                    component="div"
                    className="text-sm text-destructive"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Продать
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
