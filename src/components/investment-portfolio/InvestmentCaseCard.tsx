"use client";

import type { InvestmentCase, InvestmentAsset } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Edit3,
  Trash2,
  Package,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { INVESTMENT_ASSET_TYPE_LABELS } from "@/lib/types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"; // Added ScrollBar
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface InvestmentCaseCardProps {
  investmentCase: InvestmentCase;
  onDelete: () => void;
  onAddAsset: () => void;
  onEditAsset: (asset: InvestmentAsset) => void;
  onRemoveAsset: (assetId: string) => void;
  primaryDisplayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
}

export function InvestmentCaseCard({
  investmentCase,
  onDelete,
  onAddAsset,
  onEditAsset,
  onRemoveAsset,
  primaryDisplayCurrency,
  convertCurrency,
}: InvestmentCaseCardProps) {
  const calculateAssetProfitLoss = (asset: InvestmentAsset) => {
    const purchaseValue = asset.purchasePrice * asset.quantity;
    const currentValue = asset.currentPrice * asset.quantity;
    // Assuming purchase and current are in same currency for simplicity now
    return currentValue - purchaseValue;
  };

  const totalCaseValue = investmentCase.assets.reduce((sum, asset) => {
    return (
      sum +
      convertCurrency(
        asset.currentPrice * asset.quantity,
        asset.currency,
        primaryDisplayCurrency
      )
    );
  }, 0);

  const totalCasePurchaseValue = investmentCase.assets.reduce((sum, asset) => {
    return (
      sum +
      convertCurrency(
        asset.purchasePrice * asset.quantity,
        asset.currency,
        primaryDisplayCurrency
      )
    );
  }, 0);

  const totalCaseProfitLoss = totalCaseValue - totalCasePurchaseValue;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow flex flex-col h-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-semibold text-foreground flex items-center">
              <Package className="mr-2 h-5 w-5 text-primary" />
              {investmentCase.name}
            </CardTitle>
            {investmentCase.description && (
              <CardDescription className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {investmentCase.description}
              </CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Удалить кейс
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        {investmentCase.assets.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <AlertTriangle className="mx-auto h-10 w-10 mb-2 opacity-60" />
            <p>Активы в этом кейсе еще не добавлены.</p>
          </div>
        ) : (
          <ScrollArea className="h-[200px] w-full whitespace-nowrap">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Актив</TableHead>
                  <TableHead className="text-right">Кол-во</TableHead>
                  <TableHead className="text-right">Прибыль/Убыток</TableHead>
                  <TableHead className="text-center w-[80px]">
                    Действия
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investmentCase.assets.map(asset => {
                  const profitLoss = calculateAssetProfitLoss(asset);
                  const profitLossInPrimary = convertCurrency(
                    profitLoss,
                    asset.currency,
                    primaryDisplayCurrency
                  );
                  return (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {INVESTMENT_ASSET_TYPE_LABELS[asset.type]}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {asset.quantity.toLocaleString()}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-semibold",
                          profitLossInPrimary >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        )}
                      >
                        {profitLossInPrimary >= 0 ? (
                          <TrendingUp className="inline h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="inline h-4 w-4 mr-1" />
                        )}
                        {formatCurrency(
                          profitLossInPrimary,
                          primaryDisplayCurrency
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => onEditAsset(asset)}
                            >
                              <Edit3 className="mr-2 h-4 w-4" /> Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onRemoveAsset(asset.id)}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Удалить актив
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4 flex flex-col items-stretch gap-3">
        <div className="flex justify-between items-center text-sm font-medium">
          <span>Общая стоимость кейса:</span>
          <span className="text-primary">
            {formatCurrency(totalCaseValue, primaryDisplayCurrency)}
          </span>
        </div>
        <div
          className={cn(
            "flex justify-between items-center text-sm",
            totalCaseProfitLoss >= 0 ? "text-green-600" : "text-red-600"
          )}
        >
          <span>Общая прибыль/убыток:</span>
          <span className="font-semibold">
            {totalCaseProfitLoss >= 0 ? (
              <TrendingUp className="inline h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="inline h-4 w-4 mr-1" />
            )}
            {formatCurrency(totalCaseProfitLoss, primaryDisplayCurrency)}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddAsset}
          className="mt-2"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Добавить актив в кейс
        </Button>
      </CardFooter>
    </Card>
  );
}
