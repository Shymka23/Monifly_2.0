"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PlusCircle,
  Landmark,
  Wallet as WalletIcon,
  PiggyBank,
  CreditCard,
  Banknote,
  Coins,
  Bitcoin,
  Gem,
  Briefcase,
} from "lucide-react";
import { useBudgetStore } from "@/hooks/use-budget-store";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { WalletIconName } from "@/lib/types";
import { HexColorPicker } from "react-colorful";
import {
  Formik,
  Form,
  Field,
  ErrorMessage,
  FormikHelpers,
  FieldInputProps,
  FormikProps,
} from "formik";
import * as yup from "yup";

const CURRENCIES = [
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
  "BTC",
  "ETH",
];

const WALLET_ICONS: WalletIconName[] = [
  "Landmark",
  "Wallet",
  "PiggyBank",
  "CreditCard",
  "Banknote",
  "Coins",
  "Bitcoin",
  "Gem",
  "Briefcase",
];

const iconComponents: Record<WalletIconName, React.ElementType> = {
  Landmark,
  Wallet: WalletIcon,
  PiggyBank,
  CreditCard,
  Banknote,
  Coins,
  Bitcoin,
  Gem,
  Briefcase,
};

interface AddWalletFormValues {
  name: string;
  currency: string;
  initialBalance: string;
  icon: WalletIconName;
  color: string;
}

function createValidationSchema(t: (key: string) => string) {
  return yup.object({
    name: yup.string().required(t("validation.required")),
    currency: yup.string().required(t("validation.required")),
    initialBalance: yup
      .string()
      .required(t("validation.required"))
      .test(
        "is-number",
        t("validation.invalidAmount"),
        (v: string) => !isNaN(parseFloat(v))
      ),
    icon: yup.mixed<WalletIconName>().oneOf(WALLET_ICONS).required(),
    color: yup.string().required(t("validation.required")),
  });
}

export function AddWalletDialog({
  onWalletAdded,
}: { onWalletAdded?: (walletId: string) => void } = {}) {
  const { t } = useTranslation(["common", "wallet"]);
  const [open, setOpen] = useState(false);
  const { addWallet } = useBudgetStore(state => ({
    addWallet: state.addWallet,
  }));
  const { toast } = useToast();

  const initialValues: AddWalletFormValues = {
    name: "",
    currency: "",
    initialBalance: "",
    icon: "Landmark",
    color: "#4f46e5",
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs sm:text-sm">
          <PlusCircle className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
          {t("add", { ns: "wallet" })}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("addTitle", { ns: "wallet" })}</DialogTitle>
          <DialogDescription>
            {t("addDescription", { ns: "wallet" })}
          </DialogDescription>
        </DialogHeader>
        <Formik<AddWalletFormValues>
          initialValues={initialValues}
          validationSchema={createValidationSchema(t)}
          onSubmit={async (
            values,
            { setSubmitting, resetForm }: FormikHelpers<AddWalletFormValues>
          ) => {
            const id = Date.now().toString();
            addWallet(
              id,
              values.name,
              values.currency,
              parseFloat(values.initialBalance),
              values.icon,
              values.color
            );
            if (onWalletAdded) onWalletAdded(id);
            toast({
              title: t("added", { ns: "wallet" }),
              description: t("addedDescription", {
                ns: "wallet",
                name: values.name,
              }),
            });
            setSubmitting(false);
            resetForm();
            setOpen(false);
          }}
        >
          {({ isSubmitting, setFieldValue, values }) => (
            <Form>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="icon-picker">
                    {t("iconLabel", { ns: "wallet" })} *
                  </Label>
                  <Field name="icon">
                    {({
                      field,
                    }: {
                      field: FieldInputProps<AddWalletFormValues["icon"]>;
                    }) => (
                      <RadioGroup
                        id="icon-picker"
                        value={field.value}
                        onValueChange={(v: WalletIconName) =>
                          setFieldValue("icon", v)
                        }
                        className="grid grid-cols-5 gap-2 pt-1"
                      >
                        {WALLET_ICONS.map(iconName => {
                          const IconComponent = iconComponents[iconName];
                          return (
                            <div key={iconName}>
                              <RadioGroupItem
                                value={iconName}
                                id={iconName}
                                className="sr-only"
                              />
                              <Label
                                htmlFor={iconName}
                                className={cn(
                                  "flex aspect-square items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                                  values.icon === iconName &&
                                    "border-primary ring-2 ring-primary"
                                )}
                              >
                                <IconComponent className="h-5 w-5" />
                              </Label>
                            </div>
                          );
                        })}
                      </RadioGroup>
                    )}
                  </Field>
                  <ErrorMessage
                    name="icon"
                    component="div"
                    className="text-sm text-destructive"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="name">
                    {t("nameLabel", { ns: "wallet" })} *
                  </Label>
                  <Field
                    name="name"
                    as={Input}
                    placeholder={t("namePlaceholder", { ns: "wallet" })}
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-sm text-destructive"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color-picker">
                    {t("colorLabel", { ns: "wallet" })} *
                  </Label>
                  <Field name="color">
                    {({
                      field,
                    }: {
                      field: FieldInputProps<AddWalletFormValues["color"]>;
                    }) => (
                      <div className="flex items-center gap-4">
                        <HexColorPicker
                          color={field.value}
                          onChange={v => setFieldValue("color", v)}
                          style={{ width: 120, height: 60 }}
                        />
                        <div
                          className="w-8 h-8 rounded-full border"
                          style={{ background: field.value }}
                        />
                      </div>
                    )}
                  </Field>
                  <ErrorMessage
                    name="color"
                    component="div"
                    className="text-sm text-destructive"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="currency">
                      {t("currencyLabel", { ns: "wallet" })} *
                    </Label>
                    <Field name="currency">
                      {({
                        field,
                        form,
                      }: {
                        field: FieldInputProps<string>;
                        form: FormikProps<AddWalletFormValues>;
                      }) => (
                        <Select
                          value={field.value}
                          onValueChange={value =>
                            form.setFieldValue(field.name, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("currencyPlaceholder", {
                                ns: "wallet",
                              })}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {CURRENCIES.map(c => (
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
                    <Label htmlFor="initialBalance">
                      {t("initialBalanceLabel", { ns: "wallet" })} *
                    </Label>
                    <Field
                      name="initialBalance"
                      as={Input}
                      type="number"
                      placeholder={t("initialBalancePlaceholder", {
                        ns: "wallet",
                      })}
                    />
                    <ErrorMessage
                      name="initialBalance"
                      component="div"
                      className="text-sm text-destructive"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  {t("cancel", { ns: "wallet" })}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {t("add", { ns: "wallet" })}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
