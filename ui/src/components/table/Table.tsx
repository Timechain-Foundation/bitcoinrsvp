import { useState } from "react";
import styles from "./Table.module.css";
import classNames from "classnames";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TableProps {
  className?: string;
  columns: any[];
  rows: any[];
}

export default function Table({ className, columns, rows: data }: TableProps) {
  let [expandedIndex, setExpandedIndex] = useState<null | number>(null);
  return (
    <div className={classNames(styles.table, className)}>
      <div className={styles.tableHeader}>
        {columns.map((col: any, index: number) => {
          return (
            <p
              key={index}
              style={{
                width: col.width,
                textAlign: col.rightAlign && "right",
              }}
            >
              {col.name}
            </p>
          );
        })}
      </div>
      <div>
        {data.map((row: any, rowIndex: number) => {
          return (
            <div key={rowIndex}>
              <div
                className={styles.row}
                onClick={() =>
                  setExpandedIndex((prevExpandedIndex) =>
                    prevExpandedIndex === rowIndex ? null : rowIndex
                  )
                }
              >
                {expandedIndex === rowIndex ? (
                  <ChevronUp className={styles.applicantExpandIcon} />
                ) : (
                  <ChevronDown className={styles.applicantExpandIcon} />
                )}

                {columns.map((col: any, columnIndex: number) => {
                  let value = row[col.name?.toLowerCase()];
                  if (!value) {
                    return <></>;
                  }

                  return typeof value === "string" ? (
                    <p
                      key={columnIndex}
                      style={{
                        width: col.width,
                      }}
                    >
                      {col.name}
                    </p>
                  ) : (
                    <div
                      style={{
                        width: col.width,
                      }}
                    >
                      {value}
                    </div>
                  );
                })}
              </div>
              {expandedIndex === rowIndex && (
                <div className={styles.expanded}>{row.expanded}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
