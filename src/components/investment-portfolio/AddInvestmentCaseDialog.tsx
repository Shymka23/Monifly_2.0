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
import { PlusCircle, Briefcase, Loader2 } from "lucide-react";
import { useBudgetStore } from "@/hooks/use-budget-store";
import { useToast } from "@/hooks/use-toast";
import type { NewInvestmentCaseData } from "@/lib/types";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";

interface AddInvestmentCaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  // Add caseToEdit in future if needed
}

const caseSchema = yup.object({
  name: yup.string().required("Вкажіть назву кейсу"),
  description: yup.string(),
});

export function AddInvestmentCaseDialog({
  isOpen,
  onClose,
}: AddInvestmentCaseDialogProps) {
  const { addInvestmentCase } = useBudgetStore(state => ({
    addInvestmentCase: state.addInvestmentCase,
  }));
  const { toast } = useToast();

  const initialValues = {
    name: "",
    description: "",
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
            <Briefcase className="mr-2 h-6 w-6 text-primary" />
            Новый инвестиционный кейс
          </DialogTitle>
          <DialogDescription>
            Создайте новый кейс для группировки ваших инвестиций.
          </DialogDescription>
        </DialogHeader>
        <Formik
          initialValues={initialValues}
          validationSchema={caseSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            const caseData: NewInvestmentCaseData = {
              name: values.name,
              description: values.description.trim() || undefined,
              currency: "USD",
              title: values.name,
              startDate: new Date().toISOString(),
              assets: [],
              totalInvestment: 0,
            };
            addInvestmentCase(caseData);
            toast({
              title: "Инвестиционный кейс создан",
              description: `Кейс "${values.name}" успешно создан.`,
            });
            setSubmitting(false);
            resetForm();
            onClose();
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="space-y-4 py-4">
                <div className="space-y-1">
                  <Label htmlFor="caseName">Название кейса *</Label>
                  <Field
                    name="name"
                    as={Input}
                    placeholder="Например, Акции США"
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-sm text-destructive"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="caseDescription">
                    Описание (необязательно)
                  </Label>
                  <Field
                    name="description"
                    as={Textarea}
                    placeholder="Например, Долгосрочные инвестиции в технологический сектор"
                    rows={3}
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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PlusCircle className="mr-2 h-4 w-4" />
                  )}
                  Создать кейс
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
