import styles from "./CardList.module.css";
import classNames from "classnames";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";

interface CardListProps {
  className?: string;
  rows: any[];
}

export default function CardList({ className, rows: entries }: CardListProps) {
  let [expandedIndex, setExpandedIndex] = useState<null | number>(null);
  return (
    <div className={classNames(styles.cards, className)}>
      {entries.map((e: any, entryIndex: number) => {
        return (
          <div className={styles.card}>
            {e.rows.map((r: any) => {
              return (
                r?.fields?.length && (
                  <div className={styles.cardRow}>
                    {r.fields.map((el: any) => {
                      return el;
                    })}
                  </div>
                )
              );
            })}

            <div
              className={styles.viewDetails}
              onClick={() =>
                setExpandedIndex((prevExpandedIndex) =>
                  prevExpandedIndex === entryIndex ? null : entryIndex
                )
              }
            >
              View Details{" "}
              {expandedIndex === entryIndex ? (
                <ChevronUp className={styles.viewDetailsIcon} />
              ) : (
                <ChevronDown className={styles.viewDetailsIcon} />
              )}
            </div>

            {expandedIndex === entryIndex && (
              <div className={styles.expanded}>{e.expanded}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
