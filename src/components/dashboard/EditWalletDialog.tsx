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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Landmark,
  Wallet as WalletIcon,
  PiggyBank,
  CreditCard,
  Banknote,
  Coins,
  Bitcoin,
  Gem,
  Briefcase,
  Trash2,
  Save,
} from "lucide-react";
import { useBudgetStore } from "@/hooks/use-budget-store";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { Wallet, WalletIconName } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { HexColorPicker } from "react-colorful";
import {
  Formik,
  Form,
  Field,
  ErrorMessage,
  FormikHelpers,
  FieldInputProps,
} from "formik";
import * as yup from "yup";
import type { FieldProps, FormikProps } from "formik";

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

interface EditWalletDialogProps {
  wallet: Wallet;
  isOpen: boolean;
  onClose: () => void;
}

interface EditWalletFormValues {
  name: string;
  currency: string;
  balance: string;
  icon: WalletIconName;
  color: string;
}

const editWalletSchema: yup.Schema<EditWalletFormValues> = yup.object({
  name: yup.string().required("Введіть назву гаманця"),
  currency: yup.string().required("Оберіть валюту"),
  balance: yup
    .string()
    .required("Введіть баланс")
    .test(
      "is-number",
      "Баланс має бути числом",
      (v: string) => !isNaN(parseFloat(v))
    ),
  icon: yup.mixed<WalletIconName>().oneOf(WALLET_ICONS).required(),
  color: yup.string().required("Оберіть колір"),
});

export function EditWalletDialog({
  wallet,
  isOpen,
  onClose,
}: EditWalletDialogProps) {
  const updateWallet = useBudgetStore(state => state.updateWallet);
  const deleteWallet = useBudgetStore(state => state.deleteWallet);
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const initialValues: EditWalletFormValues = {
    name: wallet.name,
    currency: wallet.currency,
    balance: wallet.balance.toString(),
    icon: (wallet.icon as WalletIconName) || "Landmark",
    color: wallet.color || "#4f46e5",
  };

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  const handleDelete = () => {
    deleteWallet(wallet.id);
    toast({
      title: "Кошелек удален",
      description: `Кошелек "${wallet.name}" был удален.`,
    });
    setShowDeleteDialog(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редагувати гаманець</DialogTitle>
          <DialogDescription>
            Змініть параметри гаманця або видаліть його.
          </DialogDescription>
        </DialogHeader>
        <Formik<EditWalletFormValues>
          initialValues={initialValues}
          validationSchema={editWalletSchema}
          enableReinitialize
          onSubmit={async (
            values,
            { setSubmitting, resetForm }: FormikHelpers<EditWalletFormValues>
          ) => {
            updateWallet(wallet.id, {
              name: values.name,
              currency: values.currency,
              balance: parseFloat(values.balance),
              icon: values.icon,
              color: values.color,
            });
            toast({
              title: "Гаманець оновлено",
              description: `Гаманець "${values.name}" успішно оновлено.`,
            });
            setSubmitting(false);
            resetForm();
            onClose();
          }}
        >
          {({ isSubmitting, setFieldValue, values }) => (
            <Form>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="icon-picker">Іконка *</Label>
                  <Field name="icon">
                    {({
                      field,
                    }: {
                      field: FieldInputProps<EditWalletFormValues["icon"]>;
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
                  <Label htmlFor="name">Назва *</Label>
                  <Field
                    name="name"
                    as={Input}
                    placeholder="наприклад, Основний рахунок"
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-sm text-destructive"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color-picker">Колір *</Label>
                  <Field name="color">
                    {({
                      field,
                    }: {
                      field: FieldInputProps<EditWalletFormValues["color"]>;
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
                    <Label htmlFor="currency">Валюта *</Label>
                    <Field name="currency">
                      {({
                        field,
                        form,
                      }: {
                        field: FieldProps["field"];
                        form: FormikProps<EditWalletFormValues>;
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
                    <Label htmlFor="balance">Баланс *</Label>
                    <Field
                      name="balance"
                      as={Input}
                      type="number"
                      placeholder="наприклад, 1000"
                    />
                    <ErrorMessage
                      name="balance"
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
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Відміна
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="mr-2 h-5 w-5" />
                  Зберегти
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isSubmitting}
                >
                  <Trash2 className="mr-2 h-5 w-5" />
                  Видалити гаманець
                </Button>
              </DialogFooter>
              <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Видалити гаманець?</AlertDialogTitle>
                  </AlertDialogHeader>
                  <p>
                    Ви впевнені, що хочете видалити цей гаманець? Цю дію не
                    можна скасувати.
                  </p>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Скасувати</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Видалити
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
