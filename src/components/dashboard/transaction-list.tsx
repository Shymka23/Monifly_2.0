"use client";

import type { Transaction, Wallet, TransactionCategory } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { ru, uk, enUS, de, es, fr, type Locale } from "date-fns/locale";
import { formatCurrency, cn } from "@/lib/utils";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  MoreVertical,
  Edit3,
  Trash2,
  TrendingDown,
  Bitcoin,
  Briefcase,
  Utensils,
  Bus,
  Home,
  Film,
  HeartPulse,
  GraduationCap,
  DollarSign,
  Zap,
  ShoppingCart,
  Plane,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useBudgetStore } from "@/hooks/use-budget-store";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const locales: { [key: string]: Locale } = {
  uk,
  ru,
  en: enUS,
  de,
  es,
  fr,
};

const categoryIcons: Record<TransactionCategory, React.ElementType> = {
  groceries: Utensils,
  transport: Bus,
  rent: Home,
  utilities: Zap,
  entertainment: Film,
  healthcare: HeartPulse,
  education: GraduationCap,
  salary: DollarSign,
  other: Package,
  business: Briefcase,
  investment: Briefcase,
  crypto: Bitcoin,
  shopping: ShoppingCart,
  travel: Plane,
};

interface TransactionListProps {
  transactions: Transaction[];
  wallets: Wallet[];
  selectedWalletId?: string | null;
  filterPeriod: string;
  onEditTransaction: (transaction: Transaction) => void;
}

export function TransactionList({
  transactions,
  wallets,
  selectedWalletId,
  filterPeriod,
  onEditTransaction,
}: TransactionListProps) {
  const { t, i18n } = useTranslation(["transaction"]);
  const { deleteTransaction } = useBudgetStore();
  const { toast } = useToast();
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);

  const getWalletName = (walletId: string) => {
    const wallet = wallets.find(w => w.id === walletId);
    return wallet ? wallet.name : "Н/Д";
  };

  const getWalletCurrency = (walletId: string) => {
    const wallet = wallets.find(w => w.id === walletId);
    return wallet ? wallet.currency : "RUB";
  };

  const handleDeleteConfirm = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete.id);
      toast({
        title: t("deleted"),
        description: t("deletedDescription"),
      });
    }
  };

  if (transactions.length === 0) {
    return (
      <Card className="mt-6 card-modern">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight">
            {t("title")}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {selectedWalletId
              ? wallets.find(w => w.id === selectedWalletId)?.name
              : t(`periods.${filterPeriod}`, { ns: "dashboard" }).toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-6 text-center text-muted-foreground py-10">
            <div className="relative w-12 h-12 mx-auto mb-3">
              <div className="absolute inset-0 bg-primary/5 rounded-full animate-pulse"></div>
              <TrendingDown className="relative z-10 w-full h-full text-primary/50" />
            </div>
            <p className="font-medium text-foreground/80">
              {t("noTransactions")}
            </p>
            <p className="text-sm mt-1">{t("noTransactionsDescription")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mt-6 card-modern">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight">
            {t("title")}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {selectedWalletId
              ? wallets.find(w => w.id === selectedWalletId)?.name
              : t(`periods.${filterPeriod}`, { ns: "dashboard" }).toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="hover:bg-muted/5 transition-colors">
                <TableHead className="w-[120px] pl-4 font-medium">
                  {t("date")}
                </TableHead>
                <TableHead className="font-medium">
                  {t("description")}
                </TableHead>
                <TableHead className="hidden sm:table-cell font-medium">
                  {t("category")}
                </TableHead>
                <TableHead className="text-right pr-4 font-medium">
                  {t("amount")}
                </TableHead>
                <TableHead className="w-[50px] text-center pr-4"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map(transaction => {
                const CategoryIcon =
                  categoryIcons[transaction.category as TransactionCategory] ||
                  Package;
                return (
                  <TableRow
                    key={transaction.id}
                    className="hover:bg-muted/5 transition-colors"
                  >
                    <TableCell className="pl-4 font-medium text-muted-foreground">
                      {format(parseISO(transaction.date), "dd MMM yyyy", {
                        locale: locales[i18n.language.split("-")[0]] || enUS,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">
                        {transaction.description}
                      </div>
                      <div className="text-xs text-muted-foreground md:hidden">
                        {getWalletName(transaction.walletId)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1.5 w-fit hover:bg-primary/5 transition-colors"
                      >
                        <CategoryIcon className="h-3.5 w-3.5" />
                        {t(`categories.${transaction.category.toLowerCase()}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <span
                        className={cn(
                          "font-semibold flex items-center justify-end whitespace-nowrap transition-colors",
                          transaction.type === "income"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        )}
                      >
                        {transaction.type === "income" ? (
                          <ArrowUpCircle className="h-4 w-4 mr-1 transition-transform group-hover:scale-110" />
                        ) : (
                          <ArrowDownCircle className="h-4 w-4 mr-1 transition-transform group-hover:scale-110" />
                        )}
                        {formatCurrency(
                          transaction.amount,
                          getWalletCurrency(transaction.walletId)
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-center pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/5 transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">{t("actions")}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() => onEditTransaction(transaction)}
                            className="hover:bg-primary/5 transition-colors cursor-pointer"
                          >
                            <Edit3 className="mr-2 h-4 w-4" />
                            {t("edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setTransactionToDelete(transaction)}
                            className="text-destructive focus:text-destructive hover:bg-destructive/5 transition-colors cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AlertDialog
        open={!!transactionToDelete}
        onOpenChange={open => !open && setTransactionToDelete(null)}
      >
        <AlertDialogContent className="card-modern">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold tracking-tight">
              {t("deleteConfirm")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {t("deleteConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setTransactionToDelete(null)}
              className="button-modern hover:bg-primary/5 transition-colors"
            >
              {t("deleteCancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="button-modern bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-colors"
            >
              {t("deleteConfirmButton")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
