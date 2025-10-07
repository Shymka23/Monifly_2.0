"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WalletCard } from "@/components/dashboard/wallet-card";
import { TransactionList } from "@/components/dashboard/transaction-list";
import { AddWalletDialog } from "@/components/dashboard/add-wallet-dialog";
import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog";
import { EditTransactionDialog } from "@/components/dashboard/EditTransactionDialog";
import {
  useBudgetStore,
  type FilterPeriodType,
  FILTER_PERIOD_LABELS,
} from "@/hooks/use-budget-store";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FileText, SlidersHorizontal, Filter } from "lucide-react";
import MonthlySummaryChart from "@/components/dashboard/charts/monthly-summary-chart";
import CategoryPieChart from "@/components/dashboard/charts/category-pie-chart";
import WalletDistributionPieChart from "@/components/dashboard/charts/wallet-distribution-pie-chart";
import TransactionDetailsDialog from "@/components/dashboard/charts/transaction-details-dialog";
import type { Transaction, TransactionCategory, Wallet } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { useTranslation } from "@/hooks/use-translation";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { AppLoader } from "@/components/ui/app-loader";
import { EditWalletDialog } from "@/components/dashboard/EditWalletDialog";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useIsMobile } from "@/hooks/use-mobile";

export default function DashboardPage() {
  const { t } = useTranslation(["common", "dashboard", "transaction"]);

  const {
    wallets,
    transactions,
    getTransactionsByWallet,
    getTransactionsByWalletName,
    getTransactionsByDate,
    primaryDisplayCurrency,
    filterPeriod,
    setFilterPeriod,
    userProfile,
    reorderWallets,
  } = useBudgetStore(state => ({
    wallets: state.wallets,
    transactions: state.transactions,
    getTransactionsByWallet: state.getTransactionsByWallet,
    getTransactionsByWalletName: state.getTransactionsByWalletName,
    getTransactionsByDate: state.getTransactionsByDate,
    primaryDisplayCurrency: state.primaryDisplayCurrency,
    filterPeriod: state.filterPeriod,
    setFilterPeriod: state.setFilterPeriod,
    userProfile: state.userProfile,
    reorderWallets: state.reorderWallets,
  }));

  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogTransactions, setDialogTransactions] = useState<Transaction[]>(
    []
  );
  const [dialogDescription, setDialogDescription] = useState<
    string | undefined
  >(undefined);

  const [isEditTransactionDialogOpen, setIsEditTransactionDialogOpen] =
    useState(false);
  const [selectedTransactionForEdit, setSelectedTransactionForEdit] =
    useState<Transaction | null>(null);

  const [editWallet, setEditWallet] = useState<Wallet | null>(null);

  const [walletOrder, setWalletOrder] = useState(wallets.map(w => w.id));

  const isMobile = useIsMobile();

  const dateRange = useBudgetStore(state =>
    state.getDateRangeForPeriod(filterPeriod)
  );

  useEffect(() => {
    setIsClient(true);
    setWalletOrder(wallets.map(w => w.id));
  }, [wallets]);

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0]?.toUpperCase() || "";
    const last = lastName?.[0]?.toUpperCase() || "";
    return first + last || "PN";
  };

  const displayedTransactions = useMemo(() => {
    if (!isClient) return [];
    if (selectedWalletId) {
      return getTransactionsByWallet(selectedWalletId);
    }
    const { start, end } = dateRange;
    const periodTransactions = transactions.filter(tx => {
      const txDate = parseISO(tx.date);
      return txDate >= start && txDate <= end;
    });
    return periodTransactions;
  }, [
    selectedWalletId,
    transactions,
    getTransactionsByWallet,
    isClient,
    dateRange,
  ]);

  const handleCategoryChartClick = (data: {
    name: string;
    value: number;
    originalName: TransactionCategory;
  }) => {
    const { start, end } = dateRange;
    const categoryTransactions = transactions.filter(tx => {
      const txDate = parseISO(tx.date);
      return (
        tx.category === data.originalName &&
        txDate >= start &&
        txDate <= end &&
        tx.type === "expense"
      );
    });
    setDialogTitle(
      `${t("charts.expenses")}: ${data.name} (${t(`periods.${filterPeriod}`, {
        ns: "dashboard",
      })})`
    );
    setDialogDescription(
      t("charts.expensesByCategoryDescription", {
        category: data.name,
        period: t(`periods.${filterPeriod}`, { ns: "dashboard" }).toLowerCase(),
        currency: primaryDisplayCurrency,
      })
    );
    setDialogTransactions(categoryTransactions);
    setDialogOpen(true);
  };

  const handleWalletChartClick = (data: { name: string; value: number }) => {
    const walletTransactions = getTransactionsByWalletName(data.name);
    const { start, end } = dateRange;
    const periodWalletTransactions = walletTransactions.filter(tx => {
      const txDate = parseISO(tx.date);
      return txDate >= start && txDate <= end;
    });
    setDialogTitle(
      t("wallet.transactions") +
        `: ${data.name} (${t(`periods.${filterPeriod}`, {
          ns: "dashboard",
        })})`
    );
    setDialogDescription(
      t("wallet.operationsDescription", {
        wallet: data.name,
        period: t(`periods.${filterPeriod}`, { ns: "dashboard" }).toLowerCase(),
      })
    );
    setDialogTransactions(periodWalletTransactions);
    setDialogOpen(true);
  };

  const handleMonthlySummaryClick = (data: {
    date: string;
    income: number;
    expenses: number;
    balance: number;
  }) => {
    if (!data || !data.date) return;

    const dailyTransactions = getTransactionsByDate(data.date);
    const formattedDate = format(new Date(data.date), "PPP", { locale: ru }); // Date formatting can be localized later
    setDialogTitle(`${t("wallet.dailyTransactions")} ${formattedDate}`);
    setDialogDescription(
      `${t("charts.income")}: ${data.income.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })} ${primaryDisplayCurrency}, ${t(
        "charts.expenses"
      )}: ${data.expenses.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })} ${primaryDisplayCurrency}`
    );
    setDialogTransactions(dailyTransactions);
    setDialogOpen(true);
  };

  const handleOpenEditTransactionDialog = (transaction: Transaction) => {
    setSelectedTransactionForEdit(transaction);
    setIsEditTransactionDialogOpen(true);
  };

  const sensors = useSensors(useSensor(PointerSensor));
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = walletOrder.indexOf(String(active.id));
      const newIndex = walletOrder.indexOf(String(over.id));
      const newOrder = arrayMove(walletOrder, oldIndex, newIndex);
      setWalletOrder(newOrder);
      reorderWallets(newOrder);
    }
  };

  function SortableWalletCard({
    wallet,
    ...props
  }: {
    wallet: Wallet;
    onClick?: () => void;
    isSelected?: boolean;
  }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: wallet.id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      cursor: "grab",
    };
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <WalletCard wallet={wallet} {...props} />
      </div>
    );
  }

  if (!isClient) {
    return <AppLoader text={t("loading", { ns: "common" })} />;
  }

  return (
    <>
      <div className="container-fluid space-responsive animate-fade-in">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
            {t("dashboard:title")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground hidden sm:block">
            {t("dashboard:subtitle")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Link href="/settings" className="group">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 to-accent/20 animate-glow" />
                <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-primary/20 group-hover:border-primary/40 transition-all duration-300">
                  {userProfile.avatarDataUrl ? (
                    <Image
                      src={userProfile.avatarDataUrl}
                      alt={t("user.avatarAlt")}
                      fill
                      style={{ objectFit: "cover" }}
                      className="transition-all duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                      <span className="text-sm sm:text-lg font-bold text-primary">
                        {getInitials(
                          userProfile.firstName,
                          userProfile.lastName
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
            <div className="hidden sm:block">
              <h3 className="text-sm font-semibold text-foreground truncate max-w-24">
                {userProfile.firstName || t("user.defaultName")}
              </h3>
              <p className="text-xs text-muted-foreground truncate max-w-24">
                {userProfile.email?.split("@")[0] || t("user.defaultUsername")}
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <AddWalletDialog onWalletAdded={id => setSelectedWalletId(id)} />
            <AddTransactionDialog
              onTransactionAdded={id => setSelectedWalletId(id)}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 sm:p-4 rounded-xl glass border border-border/50 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <Label className="text-sm font-medium text-foreground">
              <span className="hidden sm:inline">
                {t("periodAnalysis", { ns: "dashboard" })}
              </span>
              <span className="sm:hidden">{t("labels.period")}</span>
            </Label>
          </div>
          <Select
            value={filterPeriod}
            onValueChange={value => setFilterPeriod(value as FilterPeriodType)}
          >
            <SelectTrigger className="w-full sm:w-[160px] h-8 text-xs sm:text-sm border-border/50 bg-background/80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(FILTER_PERIOD_LABELS) as FilterPeriodType[]).map(
                periodKey => (
                  <SelectItem
                    key={periodKey}
                    value={periodKey}
                    className="text-xs sm:text-sm"
                  >
                    {t(`periods.${periodKey}`, { ns: "dashboard" })}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>

        <OverviewCards />

        <MonthlySummaryChart onDataClick={handleMonthlySummaryClick} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <CategoryPieChart onCategoryClick={handleCategoryChartClick} />
          <WalletDistributionPieChart onWalletClick={handleWalletChartClick} />
        </div>

        <div className="space-y-6 mt-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
                {t("labels.walletsTitle")}
              </h2>
              {selectedWalletId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedWalletId(null)}
                >
                  {t("wallet.showAll")}
                </Button>
              )}
            </div>
            {wallets.length > 0 ? (
              isMobile ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {walletOrder.map(id => {
                    const wallet = wallets.find(w => w.id === id);
                    return wallet ? (
                      <WalletCard
                        key={wallet.id}
                        wallet={wallet}
                        onClick={() => setEditWallet(wallet)}
                        isSelected={selectedWalletId === wallet.id}
                      />
                    ) : null;
                  })}
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={walletOrder}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {walletOrder.map(id => {
                        const wallet = wallets.find(w => w.id === id);
                        return wallet ? (
                          <SortableWalletCard
                            key={wallet.id}
                            wallet={wallet}
                            onClick={() => setEditWallet(wallet)}
                            isSelected={selectedWalletId === wallet.id}
                          />
                        ) : null;
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              )
            ) : (
              <Card className="text-center py-8 border-dashed">
                <CardContent>
                  <SlidersHorizontal className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <CardTitle className="text-xl">
                    {t("wallet.noWallets")}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mb-4">
                    {t("wallet.noWalletsDescription")}
                  </CardDescription>
                  <AddWalletDialog />
                </CardContent>
              </Card>
            )}
          </div>

          <TransactionList
            transactions={displayedTransactions}
            wallets={wallets}
            selectedWalletId={selectedWalletId}
            filterPeriod={filterPeriod}
            onEditTransaction={handleOpenEditTransactionDialog}
          />
        </div>

        <div className="mt-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-6 w-6 text-primary" />
                {t("reports.title", { ns: "dashboard" })}
              </CardTitle>
              <CardDescription>
                {t("reports.description", { ns: "dashboard" })}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                {t("reports.exportOptions", { ns: "dashboard" })}
              </p>
              <Button variant="outline" className="mt-4" disabled>
                {t("reports.create", { ns: "dashboard" })}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <TransactionDetailsDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogTitle}
        transactions={dialogTransactions}
        wallets={wallets}
        description={dialogDescription}
      />
      {selectedTransactionForEdit && (
        <EditTransactionDialog
          isOpen={isEditTransactionDialogOpen}
          onClose={() => {
            setIsEditTransactionDialogOpen(false);
            setSelectedTransactionForEdit(null);
          }}
          transactionToEdit={selectedTransactionForEdit}
          wallets={wallets}
        />
      )}
      {editWallet && (
        <EditWalletDialog
          wallet={editWallet}
          isOpen={!!editWallet}
          onClose={() => setEditWallet(null)}
        />
      )}
    </>
  );
}
