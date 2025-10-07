"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TransactionList } from "@/components/dashboard/transaction-list";
import type { Transaction, Wallet } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { memo } from "react";

interface TransactionDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  transactions: Transaction[];
  wallets: Wallet[];
  description?: string;
}

const TransactionDetailsDialog = memo(function TransactionDetailsDialog(
  props: TransactionDetailsDialogProps
) {
  const { isOpen, onOpenChange, title, transactions, wallets, description } =
    props;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <ScrollArea className="flex-grow pr-6 -mr-6">
          {" "}
          {/* pr-6 and -mr-6 to account for scrollbar width if content overflows */}
          <div className="py-4">
            <TransactionList
              transactions={transactions}
              wallets={wallets}
              filterPeriod="all"
              onEditTransaction={() => {}}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
});

export default TransactionDetailsDialog;
