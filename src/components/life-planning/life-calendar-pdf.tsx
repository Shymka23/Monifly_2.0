"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { useTranslation } from "@/hooks/use-translation";
import type { LifeCalendarEntry, LifeCalendarSettings } from "@/lib/types";

interface LifeCalendarPDFProps {
  entries: (LifeCalendarEntry & {
    monthlyExpenses: number;
    monthlyIncome: number;
  })[];
  settings: LifeCalendarSettings;
  includeFinancialGoals: boolean;
  includeNotes: boolean;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
    color: "#666666",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  yearBlock: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 5,
  },
  yearTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: "#333333",
  },
  milestoneTitle: {
    fontSize: 12,
    marginBottom: 5,
    color: "#666666",
  },
  financialInfo: {
    fontSize: 10,
    color: "#888888",
    marginTop: 5,
  },
  notes: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#999999",
    marginTop: 5,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    color: "#999999",
    fontSize: 10,
  },
});

export function LifeCalendarPDF({
  entries,
  settings,
  includeFinancialGoals,
  includeNotes,
}: LifeCalendarPDFProps) {
  const { t } = useTranslation("life-goals");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>{t("export.title")}</Text>
        <Text style={styles.subtitle}>
          {t("export.subtitle", {
            age: settings.currentAge,
            targetAge: settings.targetAge,
          })}
        </Text>

        <View style={styles.section}>
          {entries.map(entry => (
            <View key={entry.year} style={styles.yearBlock}>
              <Text style={styles.yearTitle}>
                {t("yearLabel", { year: entry.year, age: entry.age })}
              </Text>

              {entry.personalMilestones.map(milestone => (
                <Text key={milestone.id} style={styles.milestoneTitle}>
                  • {milestone.title} (
                  {t(`milestones.categories.${milestone.category}`)})
                </Text>
              ))}

              {includeFinancialGoals && (
                <Text style={styles.financialInfo}>
                  {t("financialGoals.monthlyIncome")}: {entry.monthlyIncome}
                  {"\n"}
                  {t("financialGoals.monthlyExpenses")}: {entry.monthlyExpenses}
                </Text>
              )}

              {includeNotes && entry.notes && (
                <Text style={styles.notes}>{entry.notes}</Text>
              )}
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          {t("export.footer", { date: new Date().toLocaleDateString() })}
        </Text>
      </Page>
    </Document>
  );
}
