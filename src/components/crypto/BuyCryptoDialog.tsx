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
import type { Wallet, CryptoAsset } from "@/lib/types";
import { ShoppingCart, Loader2 } from "lucide-react";
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

interface BuyCryptoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fiatWallets: Wallet[];
}

interface BuyCryptoFormValues {
  selectedFiatWalletId: string;
  assetTicker: string;
  assetName: string;
  amountToBuy: string;
  pricePerUnit: string;
  purchaseCurrency: string;
}

const buyCryptoSchema: yup.Schema<BuyCryptoFormValues> = yup.object({
  selectedFiatWalletId: yup.string().required("Оберіть фіатний гаманець"),
  assetTicker: yup.string().required("Введіть тикер криптоактиву"),
  assetName: yup.string().required("Введіть назву криптоактиву"),
  amountToBuy: yup
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
  purchaseCurrency: yup.string().required("Оберіть валюту покупки"),
});

export function BuyCryptoDialog({
  isOpen,
  onClose,
  fiatWallets,
}: BuyCryptoDialogProps) {
  const { buyCrypto, primaryDisplayCurrency } = useBudgetStore();

  const initialValues: BuyCryptoFormValues = {
    selectedFiatWalletId: fiatWallets.length > 0 ? fiatWallets[0].id : "",
    assetTicker: "",
    assetName: "",
    amountToBuy: "",
    pricePerUnit: "",
    purchaseCurrency: primaryDisplayCurrency || "",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5 text-primary" />
            Купить криптовалюту
          </DialogTitle>
          <DialogDescription>
            Зафиксируйте покупку криптоактива. Средства будут списаны с
            выбранного фиатного кошелька.
          </DialogDescription>
        </DialogHeader>
        <Formik
          initialValues={initialValues}
          validationSchema={buyCryptoSchema}
          enableReinitialize
          onSubmit={async (
            values,
            { setSubmitting, resetForm }: FormikHelpers<BuyCryptoFormValues>
          ) => {
            setSubmitting(true);
            const success = buyCrypto(
              values.selectedFiatWalletId,
              values.assetTicker.toUpperCase() as unknown as CryptoAsset,
              values.assetName,
              parseFloat(values.amountToBuy),
              parseFloat(values.pricePerUnit),
              values.purchaseCurrency
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
                  <Label htmlFor="fiatWallet">Списать с кошелька *</Label>
                  <Field name="selectedFiatWalletId">
                    {({
                      field,
                      form,
                    }: {
                      field: FieldProps["field"];
                      form: FormikProps<BuyCryptoFormValues>;
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
                    <Label htmlFor="assetTicker">Тикер актива *</Label>
                    <Field
                      name="assetTicker"
                      as={Input}
                      placeholder="Например, BTC"
                    />
                    <ErrorMessage
                      name="assetTicker"
                      component="div"
                      className="text-sm text-destructive"
                    />
                  </div>
                  <div>
                    <Label htmlFor="assetName">Название актива *</Label>
                    <Field
                      name="assetName"
                      as={Input}
                      placeholder="Например, Bitcoin"
                    />
                    <ErrorMessage
                      name="assetName"
                      component="div"
                      className="text-sm text-destructive"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amountToBuy">Количество крипто *</Label>
                    <Field
                      name="amountToBuy"
                      as={Input}
                      type="number"
                      placeholder="Например, 0.5"
                    />
                    <ErrorMessage
                      name="amountToBuy"
                      component="div"
                      className="text-sm text-destructive"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pricePerUnit">Цена за единицу *</Label>
                    <Field
                      name="pricePerUnit"
                      as={Input}
                      type="number"
                      placeholder="Например, 60000"
                    />
                    <ErrorMessage
                      name="pricePerUnit"
                      component="div"
                      className="text-sm text-destructive"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="purchaseCurrency">Валюта покупки *</Label>
                  <Field name="purchaseCurrency">
                    {({
                      field,
                      form,
                    }: {
                      field: FieldProps["field"];
                      form: FormikProps<BuyCryptoFormValues>;
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
                    name="purchaseCurrency"
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
                    <ShoppingCart className="mr-2 h-4 w-4" />
                  )}
                  Купить
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
